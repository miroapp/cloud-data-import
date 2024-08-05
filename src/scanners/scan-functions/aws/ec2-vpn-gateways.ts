import {EC2Client, DescribeVpnGatewaysCommand, VpnGateway} from '@aws-sdk/client-ec2'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {Credentials, Resources} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'
import {buildARN} from './common/buildArn'

export async function getEC2VpnGateways(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<VpnGateway>> {
	const client = new EC2Client({credentials, region})
	const accountId = await getAwsAccountId(credentials)

	const resources: Resources<VpnGateway> = {}

	const describeVpnGatewaysCommand = new DescribeVpnGatewaysCommand({})

	const response = await rateLimiter.throttle(() => client.send(describeVpnGatewaysCommand))

	if (response.VpnGateways) {
		for (const vpnGateway of response.VpnGateways) {
			if (vpnGateway.VpnGatewayId) {
				const arn = buildARN({
					service: 'ec2',
					region,
					accountId,
					resource: `vpn-gateway/${vpnGateway.VpnGatewayId}`,
				})
				resources[arn] = vpnGateway
			}
		}
	}

	return resources
}
