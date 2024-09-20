import {S3Client, ListBucketsCommand, Bucket, GetBucketLocationCommand} from '@aws-sdk/client-s3'
import {Credentials, Resources, RateLimiter, EnrichedBucket} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'
import {buildARN} from './common/buildArn'

export async function getS3Buckets(
	credentials: Credentials,
	rateLimiter: RateLimiter,
): Promise<Resources<EnrichedBucket>> {
	const client = new S3Client({credentials})
	const accountId = await getAwsAccountId(credentials)

	const buckets = await listBuckets(client, rateLimiter)
	const enrichedBuckets = await enrichBuckets(buckets, client, rateLimiter)

	return createBucketResources(enrichedBuckets, accountId)
}

async function listBuckets(client: S3Client, rateLimiter: RateLimiter): Promise<Bucket[]> {
	const command = new ListBucketsCommand({})
	const response = await rateLimiter.throttle(() => client.send(command))
	return response.Buckets ?? []
}

async function enrichBuckets(buckets: Bucket[], client: S3Client, rateLimiter: RateLimiter): Promise<EnrichedBucket[]> {
	const enrichPromises = buckets.map((bucket) => enrichBucket(bucket, client, rateLimiter))
	// Filter out any null results from enrichBucket
	return (await Promise.all(enrichPromises)).filter((bucket): bucket is EnrichedBucket => !!bucket)
}

async function enrichBucket(
	bucket: Bucket,
	client: S3Client,
	rateLimiter: RateLimiter,
): Promise<EnrichedBucket | null> {
	if (!bucket.Name) return null

	const command = new GetBucketLocationCommand({Bucket: bucket.Name})

	try {
		const response = await rateLimiter.throttle(() => client.send(command))

		return {
			Name: bucket.Name,
			CreationDate: bucket.CreationDate,
			// Default to 'us-east-1' if LocationConstraint is not provided
			Location: response.LocationConstraint || 'us-east-1',
		}
	} catch (error) {
		console.error(`Failed to get ${bucket.Name} bucket location (skipping bucket):`, error)
		return null
	}
}

function createBucketResources(buckets: EnrichedBucket[], accountId: string): Resources<EnrichedBucket> {
	return buckets.reduce((resources, bucket) => {
		if (!bucket.Name) return resources

		const arn = buildARN({
			service: 's3',
			region: bucket.Location,
			accountId,
			resource: bucket.Name,
		})

		resources[arn] = bucket

		return resources
	}, {} as Resources<EnrichedBucket>)
}
