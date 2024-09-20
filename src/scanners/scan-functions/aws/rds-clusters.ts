import {RDSClient, DescribeDBClustersCommand, DBCluster} from '@aws-sdk/client-rds'
import {Credentials, Resources, RateLimiter} from '@/types'

export async function getRDSClusters(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<DBCluster>> {
	const client = new RDSClient({credentials, region})

	const dbClusters: Resources<DBCluster> = {}

	let marker: string | undefined
	do {
		const describeDBClustersCommand = new DescribeDBClustersCommand({
			MaxRecords: 100,
			Marker: marker,
		})

		const describeDBClustersResponse = await rateLimiter.throttle(() => client.send(describeDBClustersCommand))

		if (describeDBClustersResponse.DBClusters) {
			for (const cluster of describeDBClustersResponse.DBClusters) {
				if (!cluster.DBClusterArn) {
					throw new Error('DBClusterArn is missing in the response')
				}

				dbClusters[cluster.DBClusterArn] = cluster
			}
		}

		marker = describeDBClustersResponse.Marker
	} while (marker)

	return dbClusters
}
