import {EC2Client, DescribeTransitGatewaysCommand} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2TransitGateways(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.EC2_TRANSIT_GATEWAYS>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeTransitGatewaysCommand = new DescribeTransitGatewaysCommand({})
	const describeTransitGatewaysResponse = await rateLimiter.throttle(() => client.send(describeTransitGatewaysCommand))
	const transitGateways = describeTransitGatewaysResponse.TransitGateways || []

	const resources: AwsResources<AwsServices.EC2_TRANSIT_GATEWAYS> = {}

	for (const transitGateway of transitGateways) {
		if (transitGateway.TransitGatewayId) {
			const arn = buildARN({
				service: 'ec2',
				region,
				accountId,
				resource: `transit-gateway/${transitGateway.TransitGatewayId}`,
			})
			resources[arn] = transitGateway
		}
	}
	return resources
}
