import {RedshiftClient, DescribeClustersCommand} from '@aws-sdk/client-redshift'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getRedshiftClusters(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.REDSHIFT_CLUSTERS>> {
	const client = new RedshiftClient({credentials, region})
	const accountId = await getAwsAccountId(credentials)
	const resources: AwsResources<AwsServices.REDSHIFT_CLUSTERS> = {}

	let marker: string | undefined
	do {
		const describeClustersCommand = new DescribeClustersCommand({
			Marker: marker,
		})

		const describeClustersResponse = await rateLimiter.throttle(() => client.send(describeClustersCommand))
		const clusters = describeClustersResponse.Clusters || []

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
