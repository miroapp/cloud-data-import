import {CloudTrailClient, ListTrailsCommand, ListTrailsCommandOutput} from '@aws-sdk/client-cloudtrail'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getCloudTrailTrails(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.CLOUDTRAIL_TRAILS>> {
	const client = new CloudTrailClient({credentials, region})

	const resources: AwsResourcesList<AwsSupportedResources.CLOUDTRAIL_TRAILS> = {}

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
