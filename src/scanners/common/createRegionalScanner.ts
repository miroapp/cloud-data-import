import {
	AwsScannerError,
	AwsRegionalScanFunction,
	AwsCredentials,
	AwsScannerLifecycleHook,
	RateLimiter,
	AwsTags,
	AwsResources,
} from '@/types'
import {CreateRegionalScannerFunction, CreateScannerOptions} from '@/scanners/types'
import {fetchTags} from '@/scanners/common/fetchTags'
import {AwsServices} from '@/constants'

type RegionalScanResult<T extends AwsServices> = {
	region: string
	resources: AwsResources<T>
	tags: AwsTags
	error: Error | null
}

async function scanRegion<T extends AwsServices>(
	service: T,
	scanFunction: AwsRegionalScanFunction<T>,
	region: string,
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	tagsRateLimiter: RateLimiter,
	hooks: AwsScannerLifecycleHook[],
): Promise<RegionalScanResult<T>> {
	try {
		// onStart hook
		hooks.forEach((hook) => hook.onStart?.(service, region))

		// Perform scan
		const resources = await scanFunction(credentials, rateLimiter, region)

		// Fetch tags
		const tags = await fetchTags(Object.keys(resources), credentials, tagsRateLimiter)

		// onComplete hook
		hooks.forEach((hook) => hook.onComplete?.(resources, service, region))

		// Return resources
		return {region, resources, tags, error: null}
	} catch (error) {
		// onError hook
		hooks.forEach((hook) => hook.onError?.(error as Error, service, region))

		// Return error
		return {region, resources: {}, tags: {}, error: error as Error}
	}
}

export const createRegionalScanner: CreateRegionalScannerFunction = <T extends AwsServices>(
	service: T,
	scanFunction: AwsRegionalScanFunction<T>,
	regions: string[],
	options: CreateScannerOptions,
) => {
	return async () => {
		const {credentials, getRateLimiter, tagsRateLimiter, hooks} = options

		// Scan each region in parallel
		const scanResults = await Promise.all(
			regions.map((region) => {
				const rateLimiter = getRateLimiter(service, region)
				return scanRegion(service, scanFunction, region, credentials, rateLimiter, tagsRateLimiter, hooks)
			}),
		)

		// Combine results into a single object
		const resources = scanResults.reduce((acc, {resources}) => {
			if (resources) {
				Object.assign(acc, resources)
			}
			return acc
		}, {} as AwsResources<T>)

		// Aggregate resource tags
		const tags = scanResults.reduce((acc, {tags}) => {
			if (tags) {
				Object.assign(acc, tags)
			}
			return acc
		}, {} as AwsTags)

		// Extract errors
		const errors: AwsScannerError[] = scanResults
			.map(({region, error}) => {
				return error ? {service, region, message: error.message} : null
			})
			.filter(Boolean) as AwsScannerError[]

		// Return the combined resources and errors
		return {resources, tags, errors}
	}
}
