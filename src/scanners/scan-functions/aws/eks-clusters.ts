import {EKSClient, ListClustersCommand, DescribeClusterCommand, Cluster} from '@aws-sdk/client-eks'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getEKSClusters(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.EKS_CLUSTERS>> {
	const client = new EKSClient({credentials, region})

	const resources: AwsResourcesList<AwsSupportedResources.EKS_CLUSTERS> = {}

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
