import {EC2Client, DescribeVpcsCommand, Vpc} from '@aws-sdk/client-ec2'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {buildARN} from './common/buildArn'
import {Credentials, Resources} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2Vpcs(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<Vpc>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId()

	const describeVpcsCommand = new DescribeVpcsCommand({})
	const describeVpcsResponse = await rateLimiter.throttle(() => client.send(describeVpcsCommand))
	const vpcs: Vpc[] = describeVpcsResponse.Vpcs || []

	const resources: {[arn: string]: Vpc} = {}
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
