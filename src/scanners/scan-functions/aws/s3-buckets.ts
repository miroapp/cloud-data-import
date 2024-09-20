import {S3Client, ListBucketsCommand, Bucket} from '@aws-sdk/client-s3'
import {Credentials, Resources, RateLimiter} from '@/types'
import {buildARN} from './common/buildArn'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getS3Buckets(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<Bucket>> {
	const client = new S3Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const listBucketsCommand = new ListBucketsCommand({})
	const listBucketsResponse = await rateLimiter.throttle(() => client.send(listBucketsCommand))

	const resources: {[arn: string]: Bucket} = {}

	for (const bucket of listBucketsResponse.Buckets || []) {
		const arn = buildARN({
			service: 's3',
			region: region,
			accountId,
			resource: `bucket/${bucket.Name}`,
		})
		resources[arn] = bucket
	}

	return resources
}
