import {RDSClient, DescribeDBClustersCommand} from '@aws-sdk/client-rds'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getRDSClusters(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.RDS_CLUSTERS>> {
	const client = new RDSClient({credentials, region})

	const dbClusters: AwsResourcesList<AwsSupportedResources.RDS_CLUSTERS> = {}

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
