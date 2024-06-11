import {EC2Client, DescribeSubnetsCommand, Subnet} from '@aws-sdk/client-ec2'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {buildARN} from './common/buildArn'
import {Credentials, Resources} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2Subnets(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<Subnet>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId()

	const describeSubnetsCommand = new DescribeSubnetsCommand({})
	const describeSubnetsResponse = await rateLimiter.throttle(() => client.send(describeSubnetsCommand))
	const subnets: Subnet[] = describeSubnetsResponse.Subnets || []

	const resources: {[arn: string]: Subnet} = {}
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
