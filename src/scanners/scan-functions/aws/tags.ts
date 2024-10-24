import {GetResourcesCommand, ResourceGroupsTaggingAPIClient} from '@aws-sdk/client-resource-groups-tagging-api'
import {AwsCredentials, AwsTags, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getAvailableTags(
	services: AwsServices[],
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
): Promise<AwsTags> {
	const client = new ResourceGroupsTaggingAPIClient({
		credentials,
	})

	const resources: AwsTags = {}

	let nextToken: string | undefined
	do {
		const command = new GetResourcesCommand({
			ResourceTypeFilters: services,
			PaginationToken: nextToken,
		})

		const response = await rateLimiter.throttle(() => client.send(command))

		for (const {ResourceARN, Tags} of response.ResourceTagMappingList ?? []) {
			if (!ResourceARN || !Tags || !Tags.length) {
				continue
			}

			resources[ResourceARN] = {}

			for (const {Key, Value} of Tags) {
				if (!Key || !Value) {
					continue
				}

				resources[ResourceARN][Key] = Value
			}
		}

		nextToken = response.PaginationToken
	} while (nextToken)

	return resources
}
