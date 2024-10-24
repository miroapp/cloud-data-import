import {AwsServices} from '@/constants'
import {AwsResources, AwsScanner, AwsTags} from '@/types'
import {GetAllAwsScannersArguments, GetAwsScannerArguments, GetAwsTagsScannerArguments} from './types'
import {createGlobalScanner} from './common/createGlobalScanner'
import {createRegionalScanner} from './common/createRegionalScanner'
import {scannerConfigs} from './scanner-configs'
import {getAvailableTags} from './scan-functions/aws/tags'

// Get scanner functions
const GLOBAL_SERVICES = [
	AwsServices.ROUTE53_HOSTED_ZONES,
	AwsServices.CLOUDFRONT_DISTRIBUTIONS,
	AwsServices.S3_BUCKETS,
] as const

export const getAwsScanner = <T extends AwsServices>({
	service,
	credentials,
	getRateLimiter,
	hooks = [],
	regions,
}: GetAwsScannerArguments<T>): AwsScanner<AwsResources<T>> => {
	const tagsRateLimiter = getRateLimiter('resource-groups-tagging')

	const options = {
		credentials,
		getRateLimiter,
		tagsRateLimiter,
		hooks,
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
}: GetAllAwsScannersArguments): AwsScanner<AwsResources<AwsServices>>[] => {
	const services = Object.values(AwsServices).filter(
		(service) => shouldIncludeGlobalServices || !GLOBAL_SERVICES.includes(service as (typeof GLOBAL_SERVICES)[number]),
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
		const service = 'resource-groups-tagging' as AwsServices
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
