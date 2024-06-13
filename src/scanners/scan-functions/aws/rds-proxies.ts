import {RDSClient, DescribeDBProxiesCommand, DBProxy} from '@aws-sdk/client-rds'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'

export async function getRDSProxies(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<DBProxy>> {
	const client = new RDSClient({credentials, region})

	const dbProxies: Resources<DBProxy> = {}

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
