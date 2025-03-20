import {AwsSupportedManagementServices, AwsSupportedResources} from '@/definitions/supported-services'
import {AwsResourcesList, AwsScanner, AwsScannerLifecycleHook, AwsTags} from '@/types'
import {GetAwsResourceScannerArguments, GetAllAwsResourceScannersArguments, GetAwsTagsScannerArguments} from './types'
import {createGlobalScanner} from './common/createGlobalScanner'
import {createRegionalScanner} from './common/createRegionalScanner'
import {scannerConfigs} from './scanner-configs'
import {getAvailableTags} from './scan-functions/aws/tags'

// @todo take this list to supported-services.ts
const GLOBAL_SERVICES: AwsSupportedResources[] = [
	AwsSupportedResources.ROUTE53_HOSTED_ZONES,
	AwsSupportedResources.CLOUDFRONT_DISTRIBUTIONS,
	AwsSupportedResources.S3_BUCKETS,
] as const

// Get scanner functions
export const getAwsScanner = <T extends AwsSupportedResources>({
	service,
	credentials,
	getRateLimiter,
	hooks,
	regions,
}: GetAwsResourceScannerArguments<T>): AwsScanner<AwsResourcesList<T>> => {
	const options = {
		credentials,
		getRateLimiter,
		hooks: (hooks || []) as AwsScannerLifecycleHook<AwsSupportedResources>[],
	}

	const config = scannerConfigs[service]

	if (config.global) {
		return createGlobalScanner(config.service, config.handler, options)
	}

	if (!regions) {
		throw new Error(`Regions are required for regional scanner: ${service}`)
	}

	return createRegionalScanner(config.service, config.handler, regions, options)
}

export const getAllAwsScanners = ({
	credentials,
	getRateLimiter,
	hooks = [],
	regions,
	shouldIncludeGlobalServices,
}: GetAllAwsResourceScannersArguments): AwsScanner<AwsResourcesList>[] => {
	const services = Object.values(AwsSupportedResources).filter(
		(service) => shouldIncludeGlobalServices || !GLOBAL_SERVICES.includes(service),
	)

	return services.map((service) =>
		getAwsScanner({
			service,
			credentials,
			getRateLimiter,
			hooks,
			regions,
		}),
	)
}

// @todo build a createCustomScanner function to allow for custom scanners
export const getTagsScanner =
	({credentials, getRateLimiter, hooks = [], services}: GetAwsTagsScannerArguments): AwsScanner<AwsTags> =>
	async () => {
		const service = AwsSupportedManagementServices.RESOURCE_GROUP_TAGGING
		const tagsRateLimiter = getRateLimiter(service)

		try {
			hooks.forEach((hook) => hook.onStart?.(service))
			const {results, errors} = await getAvailableTags(services, credentials, tagsRateLimiter)
			hooks.forEach((hook) => hook.onComplete?.(results, service))

			return {results, errors}
		} catch (error) {
			hooks.forEach((hook) => hook.onError?.(error as Error, service))
			return {
				results: {},
				errors: [
					{
						service: service,
						message: (error as Error).message,
					},
				],
			}
		}
	}
