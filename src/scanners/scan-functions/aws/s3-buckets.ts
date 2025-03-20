import {S3Client, ListBucketsCommand, Bucket, GetBucketLocationCommand} from '@aws-sdk/client-s3'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'
import {getResourceExplorerClient} from './common/getResourceExplorerClient'
import {SearchCommand, SearchCommandOutput} from '@aws-sdk/client-resource-explorer-2'
import {parse as parseArn} from '@aws-sdk/util-arn-parser'
import {AwsResourceDescriptionMap, AwsSupportedResources} from '@/definitions/supported-services'

type EnrichedBucket = AwsResourceDescriptionMap[AwsSupportedResources.S3_BUCKETS]

export async function getS3Buckets(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
): Promise<AwsResourcesList<AwsSupportedResources.S3_BUCKETS>> {
	const client = new S3Client({credentials})
	const accountId = await getAwsAccountId(credentials)

	const command = new ListBucketsCommand({})
	const response = await rateLimiter.throttle(() => client.send(command))
	const buckets = response.Buckets ?? []

	const enrichedBuckets = await (async () => {
		try {
			return await enrichBucketsUsingResourceExplorerClient(buckets, accountId, credentials, rateLimiter)
		} catch (error) {
			// If the Resource Explorer is not available, fall back to using the S3 client
			return await enrichBucketsUsingS3Client(buckets, accountId, client, rateLimiter)
		}
	})()

	return enrichedBuckets.reduce((resources, bucket) => {
		if (!bucket.Name) return resources

		const arn = `arn:aws:s3:::${bucket.Name}`
		resources[arn] = bucket

		return resources
	}, {} as AwsResourcesList<AwsSupportedResources.S3_BUCKETS>)
}

/**
 * Fetches all S3 buckets using the Resource Explorer.
 */
async function enrichBucketsUsingResourceExplorerClient(
	buckets: Bucket[],
	accountId: string,
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
): Promise<EnrichedBucket[]> {
	const client = await getResourceExplorerClient(credentials)
	let nextToken: string | undefined = undefined

	const enrichedBuckets: EnrichedBucket[] = []

	do {
		try {
			// Search for all S3 resources using the Resource Explorer
			const command = new SearchCommand({
				QueryString: 'service:s3',
				MaxResults: 1000, // The maximum number of results that can be returned in a single call
				NextToken: nextToken,
			})
			const response: SearchCommandOutput = await rateLimiter.throttle(() => client.send(command))

			if (response.Resources) {
				for (const resource of response.Resources) {
					if (!resource.Arn) continue

					// Extract the bucket name from the ARN of the resource
					const resourceExplorerFetchedBucketName = parseArn(resource.Arn).resource

					// Find the bucket in the list of buckets fetched using the S3 client
					const bucket = buckets.find((bucket) => bucket.Name === resourceExplorerFetchedBucketName)

					if (!bucket) continue

					// If Location is empty, it means the bucket is in us-east-1
					const location = resource.Region || 'us-east-1'

					// Add the bucket to the list of enriched buckets
					enrichedBuckets.push({
						...bucket,
						Account: accountId,
						Location: location,
					})
				}
			}

			nextToken = response.NextToken
		} catch (error) {
			console.error('Error fetching S3 buckets using Resource Explorer:', error)

			// re-throw the error so caller can try another method
			throw error
		}
	} while (nextToken)

	return enrichedBuckets
}

/**
 * Fetches all S3 buckets using the S3 client.
 */
async function enrichBucketsUsingS3Client(
	buckets: Bucket[],
	accountId: string,
	client: S3Client,
	rateLimiter: RateLimiter,
): Promise<EnrichedBucket[]> {
	const enrichPromises = buckets.map((bucket) => enrichBucketUsingS3Client(bucket, accountId, client, rateLimiter))
	// Filter out any null results from enrichBucket
	return (await Promise.all(enrichPromises)).filter((bucket): bucket is EnrichedBucket => !!bucket)
}

async function enrichBucketUsingS3Client(
	bucket: Bucket,
	accountId: string,
	client: S3Client,
	rateLimiter: RateLimiter,
): Promise<EnrichedBucket | null> {
	try {
		const command = new GetBucketLocationCommand({Bucket: bucket.Name})
		const response = await rateLimiter.throttle(() => client.send(command))

		// If LocationConstraint is empty, it means the bucket is in us-east-1
		return {
			...bucket,
			Account: accountId,
			Location: response.LocationConstraint || 'us-east-1',
		}
	} catch (error) {
		if (error instanceof Error && 'name' in error && error.name === 'PermanentRedirect') {
			// Extract the region from the redirect URL
			const redirectRegion = (error as any).$metadata?.httpHeaders?.['x-amz-bucket-region']
			if (redirectRegion) {
				return redirectRegion
			}
		}
		return null
	}
}
