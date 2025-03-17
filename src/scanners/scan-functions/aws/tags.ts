import {GetResourcesCommand, ResourceGroupsTaggingAPIClient} from '@aws-sdk/client-resource-groups-tagging-api'
import {AwsCredentials, AwsScannerError, AwsScannerResult, AwsTags, RateLimiter} from '@/types'
import {AwsServices, awsServiceToFilterServiceCode} from '@/constants'

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

	const serviceCodes = [...new Set(services.map((service) => awsServiceToFilterServiceCode[service] ?? service))]

	for (const serviceCode of serviceCodes) {
		try {
			let nextToken: string | undefined
			do {
				const command = new GetResourcesCommand({
					ResourceTypeFilters: [serviceCode],
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
			if (error instanceof Error) {
				errors.push({
					service: `tags-${serviceCode}`,
					message: error.message,
				})
			}
		}
	}

	return {results: tags, errors}
}
