import {RateLimiter, ResourceTags} from '@/types'
import {GetResourcesCommand, ResourceGroupsTaggingAPIClient} from '@aws-sdk/client-resource-groups-tagging-api'

export const fetchTags = async (
	resourceARNList: string[],
	rateLimiter: RateLimiter,
): Promise<ResourceTags | undefined> => {
	if (!resourceARNList.length) {
		return undefined
	}

	const client = new ResourceGroupsTaggingAPIClient()

	const tagResult: Record<string, Record<string, string | undefined>> = {}

	try {
		const command = new GetResourcesCommand({
			ResourceARNList: resourceARNList,
		})

		const response = await rateLimiter.throttle(() => client.send(command))

		for (const resourceData of response.ResourceTagMappingList ?? []) {
			for (const tagData of resourceData.Tags ?? []) {
				if (!resourceData.ResourceARN || !tagData.Key) {
					continue
				}

				if (!tagResult[resourceData.ResourceARN]) {
					tagResult[resourceData.ResourceARN] = {}
				}

				tagResult[resourceData.ResourceARN][tagData.Key] = tagData.Value
			}
		}
	} catch (error) {
		console.error('Error fetching tag resources:', error)
	}

	return tagResult
}
