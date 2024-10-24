import {EC2Client, DescribeInternetGatewaysCommand, InternetGateway} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2InternetGateways(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.EC2_INTERNET_GATEWAYS>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeInternetGatewaysCommand = new DescribeInternetGatewaysCommand({})
	const describeInternetGatewaysResponse = await rateLimiter.throttle(() =>
		client.send(describeInternetGatewaysCommand),
	)
	const internetGateways: InternetGateway[] = describeInternetGatewaysResponse.InternetGateways || []

	const resources: AwsResources<AwsServices.EC2_INTERNET_GATEWAYS> = {}

	for (const internetGateway of internetGateways) {
		if (internetGateway.InternetGatewayId) {
			const arn = buildARN({
				service: 'ec2',
				region,
				accountId,
				resource: `internet-gateway/${internetGateway.InternetGatewayId}`,
			})
			resources[arn] = internetGateway
		}
	}
	return resources
}
