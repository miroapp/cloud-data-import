import {EC2Client, DescribeNatGatewaysCommand, NatGateway} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2NatGateways(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.EC2_NAT_GATEWAYS>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeNatGatewaysCommand = new DescribeNatGatewaysCommand({})
	const describeNatGatewaysResponse = await rateLimiter.throttle(() => client.send(describeNatGatewaysCommand))
	const natGateways: NatGateway[] = describeNatGatewaysResponse.NatGateways || []

	const resources: AwsResources<AwsServices.EC2_NAT_GATEWAYS> = {}

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
