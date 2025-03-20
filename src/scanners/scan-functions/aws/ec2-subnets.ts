import {EC2Client, DescribeSubnetsCommand} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2Subnets(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.EC2_SUBNETS>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeSubnetsCommand = new DescribeSubnetsCommand({})
	const describeSubnetsResponse = await rateLimiter.throttle(() => client.send(describeSubnetsCommand))
	const subnets = describeSubnetsResponse.Subnets || []

	const resources: AwsResourcesList<AwsSupportedResources.EC2_SUBNETS> = {}
	for (const subnet of subnets) {
		if (subnet.SubnetId) {
			const arn = buildARN({
				service: 'ec2',
				region,
				accountId,
				resource: `subnet/${subnet.SubnetId}`,
			})
			resources[arn] = subnet
		}
	}
	return resources
}
