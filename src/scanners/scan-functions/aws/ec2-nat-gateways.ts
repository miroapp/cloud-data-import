import {EC2Client, DescribeNatGatewaysCommand, NatGateway} from '@aws-sdk/client-ec2'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {buildARN} from './common/buildArn'
import {Credentials, Resources} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2NatGateways(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<NatGateway>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeNatGatewaysCommand = new DescribeNatGatewaysCommand({})
	const describeNatGatewaysResponse = await rateLimiter.throttle(() => client.send(describeNatGatewaysCommand))
	const natGateways: NatGateway[] = describeNatGatewaysResponse.NatGateways || []

	const resources: {[arn: string]: NatGateway} = {}
	for (const natGateway of natGateways) {
		if (natGateway.NatGatewayId) {
			const arn = buildARN({
				service: 'ec2',
				region,
				accountId,
				resource: `nat-gateway/${natGateway.NatGatewayId}`,
			})
			resources[arn] = natGateway
		}
	}
	return resources
}
