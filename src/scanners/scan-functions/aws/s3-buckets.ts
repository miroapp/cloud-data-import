import {S3Client, ListBucketsCommand, GetBucketLocationCommand, Bucket} from '@aws-sdk/client-s3'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {buildARN} from './common/buildArn'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getS3Buckets(credentials: Credentials, rateLimiter: RateLimiter): Promise<Resources<Bucket>> {
	const client = new S3Client({credentials})

	const accountId = await getAwsAccountId()

	const listBucketsCommand = new ListBucketsCommand({})
	const listBucketsResponse = await rateLimiter.throttle(() => client.send(listBucketsCommand))

	const resources: {[arn: string]: Bucket} = {}

	for (const bucket of listBucketsResponse.Buckets || []) {
		if (bucket.Name) {
			const getBucketLocationCommand = new GetBucketLocationCommand({Bucket: bucket.Name})
			const getBucketLocationResponse = await rateLimiter.throttle(() => client.send(getBucketLocationCommand))
			const bucketRegion = getBucketLocationResponse.LocationConstraint || ''

			const arn = buildARN({
				service: 's3',
				region: bucketRegion,
				accountId,
				resource: bucket.Name,
			})
			resources[arn] = bucket
		}
	}

	return resources
}
