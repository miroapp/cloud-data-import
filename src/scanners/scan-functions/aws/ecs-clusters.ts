import {ECSClient, ListClustersCommand, DescribeClustersCommand, Cluster} from '@aws-sdk/client-ecs'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getECSClusters(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.ECS_CLUSTERS>> {
	const client = new ECSClient({credentials, region})
	const resources: AwsResourcesList<AwsSupportedResources.ECS_CLUSTERS> = {}

	let nextToken: string | undefined

	do {
		const listClustersCommand = new ListClustersCommand({nextToken})
		const listClustersResponse = await rateLimiter.throttle(() => client.send(listClustersCommand))

		const clusterArns = listClustersResponse.clusterArns || []

		if (clusterArns.length > 0) {
			const describeClustersCommand = new DescribeClustersCommand({
				clusters: clusterArns,
			})
			const describeClustersResponse = await rateLimiter.throttle(() => client.send(describeClustersCommand))

			if (describeClustersResponse.clusters) {
				for (const cluster of describeClustersResponse.clusters) {
					if (cluster.clusterArn) {
						resources[cluster.clusterArn] = cluster
					} else {
						throw new Error('Cluster ARN is missing in the response')
					}
				}
			}
		}

		nextToken = listClustersResponse.nextToken
	} while (nextToken)

	return resources
}
