import {ElastiCacheClient, DescribeCacheClustersCommand} from '@aws-sdk/client-elasticache'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getElastiCacheClusters(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.ELASTICACHE_CLUSTERS>> {
	const client = new ElastiCacheClient({credentials, region})

	const resources: AwsResources<AwsServices.ELASTICACHE_CLUSTERS> = {}

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
