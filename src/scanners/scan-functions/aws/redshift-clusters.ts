import {RedshiftClient, DescribeClustersCommand} from '@aws-sdk/client-redshift'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getRedshiftClusters(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.REDSHIFT_CLUSTERS>> {
	const client = new RedshiftClient({credentials, region})
	const accountId = await getAwsAccountId(credentials)
	const resources: AwsResourcesList<AwsSupportedResources.REDSHIFT_CLUSTERS> = {}

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
