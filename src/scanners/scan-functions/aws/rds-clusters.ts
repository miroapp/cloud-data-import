import {RDSClient, DescribeDBClustersCommand} from '@aws-sdk/client-rds'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getRDSClusters(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.RDS_CLUSTERS>> {
	const client = new RDSClient({credentials, region})

	const dbClusters: AwsResources<AwsServices.RDS_CLUSTERS> = {}

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
