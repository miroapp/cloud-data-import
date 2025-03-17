import {GetResourcesCommand, ResourceGroupsTaggingAPIClient} from '@aws-sdk/client-resource-groups-tagging-api'
import {AwsCredentials, AwsScannerError, AwsScannerResult, AwsTags, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

/**
 * Maps AWS service enum values to their corresponding resource type filter strings
 * for services where the filter name differs from the service enum value.
 *
 * While most AWS services can use their enum values directly as resource type filters
 * in the Resource Groups Tagging API, some services require specific filter strings.
 * This mapping only contains those exceptions that need special handling.
 */
const serviceFilterNameExceptions: Partial<Record<AwsServices, string>> = {
	[AwsServices.ELBV1_LOAD_BALANCERS]: 'elasticloadbalancing:loadbalancer',
	[AwsServices.ELBV2_LOAD_BALANCERS]: 'elasticloadbalancing:loadbalancer',
	[AwsServices.ELBV2_TARGET_GROUPS]: 'elasticloadbalancing:targetgroup',
	[AwsServices.S3_BUCKETS]: 's3',
	[AwsServices.CLOUDWATCH_METRIC_ALARMS]: 'cloudwatch:alarm',
	[AwsServices.EFS_FILE_SYSTEMS]: 'elasticfilesystem:filesystem',
	[AwsServices.RDS_INSTANCES]: 'rds:db',
	[AwsServices.ROUTE53_HOSTED_ZONES]: 'route53:hostedzone',
}

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

	const resourceTypes = [...new Set(services.map((service) => serviceFilterNameExceptions[service] ?? service))]

	for (const resourceType of resourceTypes) {
		try {
			let nextToken: string | undefined
			do {
				const command = new GetResourcesCommand({
					ResourceTypeFilters: [resourceType],
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
					service: `tags-${resourceType}`,
					message: error.message,
				})
			}
		}
	}

	return {results: tags, errors}
}
