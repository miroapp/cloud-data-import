import {EC2Client, DescribeVpcsCommand} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2Vpcs(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.EC2_VPCS>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeVpcsCommand = new DescribeVpcsCommand({})
	const describeVpcsResponse = await rateLimiter.throttle(() => client.send(describeVpcsCommand))
	const vpcs = describeVpcsResponse.Vpcs || []

	const resources: AwsResourcesList<AwsSupportedResources.EC2_VPCS> = {}

	for (const vpc of vpcs) {
		if (vpc.VpcId) {
			const arn = buildARN({
				service: 'ec2',
				region,
				accountId,
				resource: `vpc/${vpc.VpcId}`,
			})
			resources[arn] = vpc
		}
	}
	return resources
}
