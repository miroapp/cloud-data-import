import {Credentials, RateLimiter, ResourceTags} from '@/types'
import {GetResourcesCommand, ResourceGroupsTaggingAPIClient} from '@aws-sdk/client-resource-groups-tagging-api'
import {chunkArray} from '@/aws-app/utils/randomUtils'

/**
 * The `GetResourcesCommand` accepts a maximum of 100 ARN's
 * @see https://docs.aws.amazon.com/resourcegroupstagging/latest/APIReference/API_GetResources.html
 */
const RESOURCE_ARN_LIST_CHUNK_SIZE = 100

export const fetchTags = async (
	resourceARNList: string[],
	credentials: Credentials,
	rateLimiter: RateLimiter,
): Promise<ResourceTags> => {
	if (!resourceARNList.length) {
		return {}
	}

	const client = new ResourceGroupsTaggingAPIClient({credentials})
	const tagResult: Record<string, Record<string, string | undefined>> = {}
	const resourceChunks = chunkArray(resourceARNList, RESOURCE_ARN_LIST_CHUNK_SIZE)

	try {
		for (const chunk of resourceChunks) {
			let paginationToken: string | undefined = undefined

			do {
				const command: GetResourcesCommand = new GetResourcesCommand({
					ResourceARNList: chunk,
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
		}
	} catch (error) {
		console.error('Error fetching tag resources:', error)
	}

	return tagResult
}
