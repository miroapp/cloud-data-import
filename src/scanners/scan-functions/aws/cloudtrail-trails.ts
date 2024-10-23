import {CloudTrailClient, ListTrailsCommand, ListTrailsCommandOutput} from '@aws-sdk/client-cloudtrail'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getCloudTrailTrails(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.CLOUDTRAIL_TRAILS>> {
	const client = new CloudTrailClient({credentials, region})

	const resources: AwsResources<AwsServices.CLOUDTRAIL_TRAILS> = {}

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
