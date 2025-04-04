import {RDSClient, DescribeDBProxiesCommand} from '@aws-sdk/client-rds'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getRDSProxies(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.RDS_PROXIES>> {
	const client = new RDSClient({credentials, region})

	const dbProxies: AwsResourcesList<AwsSupportedResources.RDS_PROXIES> = {}

	let marker: string | undefined
	do {
		const describeDBProxiesCommand = new DescribeDBProxiesCommand({
			MaxRecords: 100,
			Marker: marker,
		})

		const describeDBProxiesResponse = await rateLimiter.throttle(() => client.send(describeDBProxiesCommand))

		if (describeDBProxiesResponse.DBProxies) {
			for (const proxy of describeDBProxiesResponse.DBProxies) {
				if (!proxy.DBProxyArn) {
					throw new Error('DBProxyArn is missing in the response')
				}

				dbProxies[proxy.DBProxyArn] = proxy
			}
		}

		marker = describeDBProxiesResponse.Marker
	} while (marker)

	return dbProxies
}
