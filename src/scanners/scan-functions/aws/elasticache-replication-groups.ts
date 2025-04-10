import {ElastiCacheClient, DescribeReplicationGroupsCommand} from '@aws-sdk/client-elasticache'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getElastiCacheReplicationGroups(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.ELASTICACHE_REPLICATION_GROUPS>> {
	const client = new ElastiCacheClient({credentials, region})

	const resources: AwsResourcesList<AwsSupportedResources.ELASTICACHE_REPLICATION_GROUPS> = {}

	let marker: string | undefined
	do {
		const describeReplicationGroupsCommand = new DescribeReplicationGroupsCommand({
			Marker: marker,
		})
		const describeReplicationGroupsResponse = await rateLimiter.throttle(() =>
			client.send(describeReplicationGroupsCommand),
		)

		for (const group of describeReplicationGroupsResponse.ReplicationGroups || []) {
			if (group.ARN) {
				resources[group.ARN] = group
			}
		}

		marker = describeReplicationGroupsResponse.Marker
	} while (marker)

	return resources
}
