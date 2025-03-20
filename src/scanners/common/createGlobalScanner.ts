import {AwsGlobalScanFunction, AwsCredentials, AwsScannerLifecycleHook, RateLimiter, AwsResourcesList} from '@/types'
import {CreateGlobalResourceScannerFunction, CreateScannerOptions} from '@/scanners/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

type GlobalScanResult<T extends AwsSupportedResources> = {
	resources: AwsResourcesList<T>
	error: Error | null
}

async function performGlobalScan<T extends AwsSupportedResources>(
	service: T,
	scanFunction: AwsGlobalScanFunction<T>,
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	hooks: AwsScannerLifecycleHook<AwsSupportedResources>[],
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

export const createGlobalScanner: CreateGlobalResourceScannerFunction = <T extends AwsSupportedResources>(
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
