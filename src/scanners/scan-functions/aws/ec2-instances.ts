import {EC2Client, DescribeInstancesCommand} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2Instances(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.EC2_INSTANCES>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeInstancesCommand = new DescribeInstancesCommand({})
	const describeInstancesResponse = await rateLimiter.throttle(() => client.send(describeInstancesCommand))
	const instances = describeInstancesResponse.Reservations?.flatMap((reservation) => reservation.Instances || []) || []

	const resources: AwsResourcesList<AwsSupportedResources.EC2_INSTANCES> = {}

	for (const instance of instances) {
		if (instance.InstanceId) {
			const arn = buildARN({
				service: 'ec2',
				region,
				accountId,
				resource: `instance/${instance.InstanceId}`,
			})
			resources[arn] = instance
		}
	}
	return resources
}
