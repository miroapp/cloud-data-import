import {EC2Client, DescribeNetworkInterfacesCommand, NetworkInterface} from '@aws-sdk/client-ec2'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {Credentials, Resources} from '@/types'
import {buildARN} from './common/buildArn'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2NetworkInterfaces(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<NetworkInterface>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId()

	const resources: Resources<NetworkInterface> = {}
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
