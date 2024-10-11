import {
	Resources,
	ResourceDescription,
	ScannerError,
	RegionalScanFunction,
	Credentials,
	ScannerLifecycleHook,
	RateLimiter,
	ResourceTags,
} from '@/types'
import {CreateRegionalScannerFunction, GetRateLimiterFunction} from '@/scanners/types'
import {fetchTags} from '@/scanners/common/fetchTags'

type RegionScanResult<T extends ResourceDescription> = {
	region: string
	resources: Resources<T> | null
	tags?: ResourceTags
	error: Error | null
}

async function scanRegion<T extends ResourceDescription>(
	service: string,
	scanFunction: RegionalScanFunction<T>,
	region: string,
	credentials: Credentials,
	rateLimiter: RateLimiter,
	hooks: ScannerLifecycleHook[],
): Promise<RegionScanResult<T>> {
	try {
		// onStart hook
		hooks.forEach((hook) => hook.onStart?.(service, region))

		// Perform scan
		const resources = await scanFunction(credentials, rateLimiter, region)

		// Fetch tags
		const tags = await fetchTags(Object.keys(resources), rateLimiter)

		// onComplete hook
		hooks.forEach((hook) => hook.onComplete?.(resources, service, region))

		// Return resources
		return {region, resources, tags, error: null}
	} catch (error) {
		// onError hook
		hooks.forEach((hook) => hook.onError?.(error as Error, service, region))

		// Return error
		return {region, resources: null, error: error as Error}
	}
}

export const createRegionalScanner: CreateRegionalScannerFunction = <T extends ResourceDescription>(
	service: string,
	scanFunction: RegionalScanFunction<T>,
	regions: string[],
	options: {
		credentials: Credentials
		getRateLimiter: GetRateLimiterFunction
		hooks: ScannerLifecycleHook[]
	},
) => {
	return async () => {
		const {credentials, getRateLimiter, hooks} = options

		// Scan each region in parallel
		const scanResults = await Promise.all(
			regions.map((region) => {
				const rateLimiter = getRateLimiter(service, region)
				return scanRegion(service, scanFunction, region, credentials, rateLimiter, hooks)
			}),
		)

		// Combine results into a single object
		const resources = scanResults.reduce((acc, {resources}) => {
			if (resources) {
				Object.assign(acc, resources)
			}
			return acc
		}, {} as Resources<T>)

		// Aggregate resource tags
		const tags = scanResults.reduce((acc, {tags}) => {
			if (tags) {
				Object.assign(acc, tags)
			}
			return acc
		}, {} as ResourceTags)

		// Extract errors
		const errors: ScannerError[] = scanResults
			.map(({region, error}) => {
				return error ? {service, region, message: error.message} : null
			})
			.filter(Boolean) as ScannerError[]

		// Return the combined resources and errors
		return {resources, tags, errors}
	}
}
