import {
	Resources,
	ResourceDescription,
	ScannerError,
	RegionalScanFunction,
	Credentials,
	ScannerLifecycleHook,
} from '../../types'
import {RateLimiter} from './RateLimiter'
import {CreateRegionalScannerFunction, GetRegionalRateLimiterFunction} from '../types'

type RegionScanResult<T extends ResourceDescription> = {
	region: string
	resources: Resources<T> | null
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

		// onComplete hook
		hooks.forEach((hook) => hook.onComplete?.(resources, service, region))

		// Return resources
		return {region, resources, error: null}
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
		getRateLimiter: GetRegionalRateLimiterFunction
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

		// Extract errors
		const errors: ScannerError[] = scanResults
			.map(({region, error}) => {
				return error ? {service, region, message: error.message} : null
			})
			.filter(Boolean) as ScannerError[]

		// Return the combined resources and errors
		return {resources, errors}
	}
}
