import {Credentials, RateLimiter, ResourceTags} from '@/types'
import {GetResourcesCommand, ResourceGroupsTaggingAPIClient} from '@aws-sdk/client-resource-groups-tagging-api'

export const fetchTags = async (credentials: Credentials, rateLimiter: RateLimiter): Promise<ResourceTags> => {
	const client = new ResourceGroupsTaggingAPIClient({credentials})
	const tagResult: Record<string, Record<string, string | undefined>> = {}

	try {
		let paginationToken: string | undefined = undefined

		do {
			const command: GetResourcesCommand = new GetResourcesCommand({
				PaginationToken: paginationToken,
			})

			const response = await rateLimiter.throttle(() => client.send(command))
			paginationToken = response.PaginationToken

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
		} while (paginationToken)
	} catch (error) {
		console.error('Error fetching tag resources:', error)
	}

	console.log(tagResult)

	return tagResult
}
