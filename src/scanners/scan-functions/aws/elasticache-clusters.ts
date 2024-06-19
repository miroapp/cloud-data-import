import {ElastiCacheClient, DescribeCacheClustersCommand, CacheCluster} from '@aws-sdk/client-elasticache'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'

export async function getElastiCacheClusters(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<CacheCluster>> {
	const client = new ElastiCacheClient({credentials, region})

	const describeCacheClustersCommand = new DescribeCacheClustersCommand({ShowCacheNodeInfo: true})
	const describeCacheClustersResponse = await rateLimiter.throttle(() => client.send(describeCacheClustersCommand))

	const resources: {[arn: string]: CacheCluster} = {}
	for (const cluster of describeCacheClustersResponse.CacheClusters || []) {
		if (cluster.ARN) {
			resources[cluster.ARN] = cluster
		}
	}

	return resources
}
