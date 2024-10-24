import {
	AwsGlobalScanFunction,
	AwsCredentials,
	AwsScannerLifecycleHook,
	RateLimiter,
	AwsTags,
	AwsResources,
} from '@/types'
import {CreateGlobalScannerFunction, CreateScannerOptions, GetRateLimiterFunction} from '@/scanners/types'
import {fetchTags} from '@/scanners/common/fetchTags'
import {AwsServices} from '@/constants'

type GlobalScanResult<T extends AwsServices> = {
	resources: AwsResources<T>
	tags: AwsTags
	error: Error | null
}

async function performGlobalScan<T extends AwsServices>(
	service: T,
	scanFunction: AwsGlobalScanFunction<T>,
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	tagsRateLimiter: RateLimiter,
	hooks: AwsScannerLifecycleHook[],
): Promise<GlobalScanResult<T>> {
	try {
		// onStart hook
		hooks.forEach((hook) => hook.onStart?.(service))

		// Perform scan
		const resources = await scanFunction(credentials, rateLimiter)

		// Fetch tags
		const tags = await fetchTags(Object.keys(resources), credentials, tagsRateLimiter)

		// onComplete hook
		hooks.forEach((hook) => hook.onComplete?.(resources, service))

		// Return resources
		return {resources, tags, error: null}
	} catch (error) {
		// onError hook
		hooks.forEach((hook) => hook.onError?.(error as Error, service))

		// Return error
		return {resources: {}, tags: {}, error: error as Error}
	}
}

export const createGlobalScanner: CreateGlobalScannerFunction = <T extends AwsServices>(
	service: T,
	scanFunction: AwsGlobalScanFunction<T>,
	options: CreateScannerOptions,
) => {
	return async () => {
		const {credentials, getRateLimiter, tagsRateLimiter, hooks} = options

		// Perform global scan
		const rateLimiter = getRateLimiter(service)
		const {resources, tags, error} = await performGlobalScan(
			service,
			scanFunction,
			credentials,
			rateLimiter,
			tagsRateLimiter,
			hooks,
		)

		// Return resources and errors
		return {
			resources,
			tags,
			errors: error ? [{service, message: error.message}] : [],
		}
	}
}
