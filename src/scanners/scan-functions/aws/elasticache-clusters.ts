import {ElastiCacheClient, DescribeCacheClustersCommand, CacheCluster} from '@aws-sdk/client-elasticache'
import {Credentials, Resources, RateLimiter} from '@/types'

export async function getElastiCacheClusters(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<CacheCluster>> {
	const client = new ElastiCacheClient({credentials, region})

	const resources: {[arn: string]: CacheCluster} = {}

	let marker: string | undefined
	do {
		const describeCacheClustersCommand = new DescribeCacheClustersCommand({
			ShowCacheNodeInfo: true,
			Marker: marker,
		})
		const describeCacheClustersResponse = await rateLimiter.throttle(() => client.send(describeCacheClustersCommand))

		for (const cluster of describeCacheClustersResponse.CacheClusters || []) {
			if (cluster.ARN) {
				resources[cluster.ARN] = cluster
			}
		}

		marker = describeCacheClustersResponse.Marker
	} while (marker)

	return resources
}
