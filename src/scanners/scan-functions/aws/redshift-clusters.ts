import {RedshiftClient, DescribeClustersCommand, Cluster} from '@aws-sdk/client-redshift'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {buildARN} from './common/buildArn'
import {Credentials, Resources} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getRedshiftClusters(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<Cluster>> {
	const client = new RedshiftClient({credentials, region})
	const accountId = await getAwsAccountId()
	const resources: {[arn: string]: Cluster} = {}

	let marker: string | undefined
	do {
		const describeClustersCommand = new DescribeClustersCommand({
			Marker: marker,
		})

		const describeClustersResponse = await rateLimiter.throttle(() => client.send(describeClustersCommand))
		const clusters: Cluster[] = describeClustersResponse.Clusters || []

		for (const cluster of clusters) {
			if (cluster.ClusterIdentifier) {
				const arn = buildARN({
					service: 'redshift',
					region,
					accountId,
					resource: `cluster:${cluster.ClusterIdentifier}`,
				})
				resources[arn] = cluster
			}
		}

		marker = describeClustersResponse.Marker
	} while (marker)

	return resources
}
