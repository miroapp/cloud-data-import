import {EKSClient, ListClustersCommand, DescribeClusterCommand, Cluster} from '@aws-sdk/client-eks'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'

export async function getEKSClusters(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<Cluster>> {
	const client = new EKSClient({credentials, region})

	const resources: {[arn: string]: Cluster} = {}

	let nextToken: string | undefined
	do {
		const listClustersCommand = new ListClustersCommand({
			nextToken,
		})

		const listClustersResponse = await rateLimiter.throttle(() => client.send(listClustersCommand))

		if (listClustersResponse.clusters) {
			for (const clusterName of listClustersResponse.clusters) {
				const describeClusterCommand = new DescribeClusterCommand({name: clusterName})
				const describeClusterResponse = await rateLimiter.throttle(() => client.send(describeClusterCommand))

				if (describeClusterResponse.cluster && describeClusterResponse.cluster.arn) {
					resources[describeClusterResponse.cluster.arn] = describeClusterResponse.cluster
				} else {
					throw new Error('Cluster or Cluster ARN is missing in the response')
				}
			}
		}

		nextToken = listClustersResponse.nextToken
	} while (nextToken)

	return resources
}
