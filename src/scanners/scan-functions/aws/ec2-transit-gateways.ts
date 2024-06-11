import {EC2Client, DescribeTransitGatewaysCommand, TransitGateway} from '@aws-sdk/client-ec2'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {buildARN} from './common/buildArn'
import {Credentials, Resources} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2TransitGateways(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<TransitGateway>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId()

	const describeTransitGatewaysCommand = new DescribeTransitGatewaysCommand({})
	const describeTransitGatewaysResponse = await rateLimiter.throttle(() => client.send(describeTransitGatewaysCommand))
	const transitGateways: TransitGateway[] = describeTransitGatewaysResponse.TransitGateways || []

	const resources: {[arn: string]: TransitGateway} = {}
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
