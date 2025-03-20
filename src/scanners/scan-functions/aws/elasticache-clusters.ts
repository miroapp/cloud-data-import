import {ElastiCacheClient, DescribeCacheClustersCommand} from '@aws-sdk/client-elasticache'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getElastiCacheClusters(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.ELASTICACHE_CLUSTERS>> {
	const client = new ElastiCacheClient({credentials, region})

	const resources: AwsResourcesList<AwsSupportedResources.ELASTICACHE_CLUSTERS> = {}

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
