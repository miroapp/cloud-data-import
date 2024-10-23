import {EC2Client, DescribeNetworkInterfacesCommand} from '@aws-sdk/client-ec2'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'
import {buildARN} from './common/buildArn'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2NetworkInterfaces(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.EC2_NETWORK_INTERFACES>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const resources: AwsResources<AwsServices.EC2_NETWORK_INTERFACES> = {}

	let nextToken: string | undefined

	do {
		const describeNetworkInterfacesCommand = new DescribeNetworkInterfacesCommand({
			NextToken: nextToken,
		})

		const response = await rateLimiter.throttle(() => client.send(describeNetworkInterfacesCommand))

		if (response.NetworkInterfaces) {
			for (const eni of response.NetworkInterfaces) {
				if (eni.NetworkInterfaceId) {
					const arn = buildARN({
						service: 'ec2',
						region,
						accountId: eni.OwnerId || accountId,
						resource: `network-interface/${eni.NetworkInterfaceId}`,
					})
					resources[arn] = eni
				}
			}
		}

		nextToken = response.NextToken
	} while (nextToken)

	return resources
}
