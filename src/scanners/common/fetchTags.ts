import {Credentials, RateLimiter, ResourceTags} from '@/types'
import {GetResourcesCommand, ResourceGroupsTaggingAPIClient} from '@aws-sdk/client-resource-groups-tagging-api'

export const fetchTags = async (
	arnList: string[],
	credentials: Credentials,
	rateLimiter: RateLimiter,
): Promise<ResourceTags> => {
	const client = new ResourceGroupsTaggingAPIClient({credentials})
	const tagResult: Record<string, Record<string, string | undefined>> = {}

	const chunkSize = 100 // Set maximum number of ARNs per call
	const chunks = []

	// Create chunks of ARN list
	for (let i = 0; i < arnList.length; i += chunkSize) {
		chunks.push(arnList.slice(i, i + chunkSize))
	}

	try {
		for (const chunk of chunks) {
			let paginationToken: string | undefined = undefined

			do {
				const command: GetResourcesCommand = new GetResourcesCommand({
					PaginationToken: paginationToken,
					ResourceARNList: chunk,
				})

				let response
				try {
					response = await rateLimiter.throttle(() => client.send(command))
				} catch {
					return {}
				}

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
