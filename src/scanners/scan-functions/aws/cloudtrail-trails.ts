import {CloudTrailClient, ListTrailsCommand, ListTrailsCommandOutput, TrailInfo} from '@aws-sdk/client-cloudtrail'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'

export async function getCloudTrailTrails(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<TrailInfo>> {
	const client = new CloudTrailClient({credentials, region})

	const resources: {[arn: string]: TrailInfo} = {}

	let nextToken: string | undefined
	do {
		const listTrailsCommand = new ListTrailsCommand({
			NextToken: nextToken,
		})
		const listTrailsResponse: ListTrailsCommandOutput = await rateLimiter.throttle(() => client.send(listTrailsCommand))

		for (const trail of listTrailsResponse.Trails || []) {
			if (trail.TrailARN) {
				resources[trail.TrailARN] = trail
			}
		}

		nextToken = listTrailsResponse.NextToken
	} while (nextToken)

	return resources
}
