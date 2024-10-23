import {EC2Client, DescribeVpcsCommand} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2Vpcs(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.EC2_VPCS>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeVpcsCommand = new DescribeVpcsCommand({})
	const describeVpcsResponse = await rateLimiter.throttle(() => client.send(describeVpcsCommand))
	const vpcs = describeVpcsResponse.Vpcs || []

	const resources: AwsResources<AwsServices.EC2_VPCS> = {}

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
