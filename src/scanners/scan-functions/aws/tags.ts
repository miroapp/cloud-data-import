import {GetResourcesCommand, ResourceGroupsTaggingAPIClient} from '@aws-sdk/client-resource-groups-tagging-api'
import {AwsCredentials, AwsScannerError, AwsScannerResult, AwsTags, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getAvailableTags(
	services: AwsServices[],
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
): Promise<AwsScannerResult<AwsTags>> {
	const client = new ResourceGroupsTaggingAPIClient({
		credentials,
	})

	const tags: AwsTags = {}
	const errors: AwsScannerError[] = []

	for (const service of services) {
		try {
			let nextToken: string | undefined
			do {
				const command = new GetResourcesCommand({
					ResourceTypeFilters: [service],
					PaginationToken: nextToken,
				})

				const response = await rateLimiter.throttle(() => client.send(command))

				for (const {ResourceARN, Tags} of response.ResourceTagMappingList ?? []) {
					if (!ResourceARN || !Tags || !Tags.length) {
						continue
					}

					tags[ResourceARN] = {}

					for (const {Key, Value} of Tags) {
						if (!Key || !Value) {
							continue
						}

						tags[ResourceARN][Key] = Value
					}
				}

				nextToken = response.PaginationToken
			} while (nextToken)
		} catch (error) {
			if (error instanceof Error && error.message.includes('Unsupported service=')) {
				errors.push({
					service: `tags-${service}`,
					message: error.message,
				})
			}
		}
	}

	return {results: tags, errors}
}
