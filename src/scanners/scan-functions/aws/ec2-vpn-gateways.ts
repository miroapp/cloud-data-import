import {EC2Client, DescribeVpnGatewaysCommand, VpnGateway} from '@aws-sdk/client-ec2'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'
import {getAwsAccountId} from './common/getAwsAccountId'
import {buildARN} from './common/buildArn'

export async function getEC2VpnGateways(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.EC2_VPN_GATEWAYS>> {
	const client = new EC2Client({credentials, region})
	const accountId = await getAwsAccountId(credentials)

	const resources: AwsResources<AwsServices.EC2_VPN_GATEWAYS> = {}

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
