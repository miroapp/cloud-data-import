import {AwsServices} from '@/constants'
import {AwsResources, AwsScanner} from '@/types'
import {GetAllAwsScannersArguments, GetAwsScannerArguments} from './types'
import {createGlobalScanner} from './common/createGlobalScanner'
import {createRegionalScanner} from './common/createRegionalScanner'
import {scannerConfigs} from './scanner-configs'

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
