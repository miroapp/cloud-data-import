import {EC2Client, DescribeInstancesCommand, Instance} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {Credentials, Resources, RateLimiter} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2Instances(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<Instance>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeInstancesCommand = new DescribeInstancesCommand({})
	const describeInstancesResponse = await rateLimiter.throttle(() => client.send(describeInstancesCommand))
	const instances: Instance[] =
		describeInstancesResponse.Reservations?.flatMap((reservation) => reservation.Instances || []) || []

	const resources: {[arn: string]: Instance} = {}
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
