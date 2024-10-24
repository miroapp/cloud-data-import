import {AwsGlobalScanFunction, AwsCredentials, AwsScannerLifecycleHook, RateLimiter, AwsResources} from '@/types'
import {CreateGlobalScannerFunction, CreateScannerOptions, GetRateLimiterFunction} from '@/scanners/types'
import {AwsServices} from '@/constants'

type GlobalScanResult<T extends AwsServices> = {
	resources: AwsResources<T>
	error: Error | null
}

async function performGlobalScan<T extends AwsServices>(
	service: T,
	scanFunction: AwsGlobalScanFunction<T>,
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	hooks: AwsScannerLifecycleHook[],
): Promise<GlobalScanResult<T>> {
	try {
		// onStart hook
		hooks.forEach((hook) => hook.onStart?.(service))

		// Perform scan
		const resources = await scanFunction(credentials, rateLimiter)

		// onComplete hook
		hooks.forEach((hook) => hook.onComplete?.(resources, service))

		// Return resources
		return {resources, error: null}
	} catch (error) {
		// onError hook
		hooks.forEach((hook) => hook.onError?.(error as Error, service))

		// Return error
		return {resources: {}, error: error as Error}
	}
}

export const createGlobalScanner: CreateGlobalScannerFunction = <T extends AwsServices>(
	service: T,
	scanFunction: AwsGlobalScanFunction<T>,
	options: CreateScannerOptions,
) => {
	return async () => {
		const {credentials, getRateLimiter, hooks} = options

		// Perform global scan
		const rateLimiter = getRateLimiter(service)
		const {resources, error} = await performGlobalScan(service, scanFunction, credentials, rateLimiter, hooks)

		// Return resources and errors
		return {
			results: resources,
			errors: error ? [{service, message: error.message}] : [],
		}
	}
}
