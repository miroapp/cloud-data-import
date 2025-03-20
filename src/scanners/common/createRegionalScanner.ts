import {
	AwsScannerError,
	AwsRegionalScanFunction,
	AwsCredentials,
	AwsScannerLifecycleHook,
	RateLimiter,
	AwsResourcesList,
} from '@/types'
import {CreateRegionalResourceScannerFunction, CreateScannerOptions} from '@/scanners/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

type RegionalScanResult<T extends AwsSupportedResources> = {
	region: string
	resources: AwsResourcesList<T>
	error: Error | null
}

async function scanRegion<T extends AwsSupportedResources>(
	service: T,
	scanFunction: AwsRegionalScanFunction<T>,
	region: string,
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	hooks: AwsScannerLifecycleHook<T>[],
): Promise<RegionalScanResult<T>> {
	try {
		// onStart hook
		hooks.forEach((hook) => hook.onStart?.(service, region))

		// Perform scan
		const resources = await scanFunction(credentials, rateLimiter, region)

		// onComplete hook
		hooks.forEach((hook) => hook.onComplete?.(resources, service, region))

		// Return resources
		return {region, resources, error: null}
	} catch (error) {
		// onError hook
		hooks.forEach((hook) => hook.onError?.(error as Error, service, region))

		// Return error
		return {region, resources: {}, error: error as Error}
	}
}

export const createRegionalScanner: CreateRegionalResourceScannerFunction = <T extends AwsSupportedResources>(
	service: T,
	scanFunction: AwsRegionalScanFunction<T>,
	regions: string[],
	options: CreateScannerOptions,
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
		}, {} as AwsResourcesList<T>)

		// Extract errors
		const errors: AwsScannerError[] = scanResults
			.map(({region, error}) => {
				return error ? {service, region, message: error.message} : null
			})
			.filter(Boolean) as AwsScannerError[]

		// Return the combined resources and errors
		return {results: resources, errors}
	}
}
