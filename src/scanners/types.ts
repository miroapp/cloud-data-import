import {
	AllSupportedAwsServices,
	AwsSupportedManagementServices,
	AwsSupportedResources,
} from '@/definitions/supported-services'
import {
	AwsScanner,
	AwsRegionalScanFunction,
	AwsGlobalScanFunction,
	AwsCredentials,
	RateLimiter,
	AwsResourcesList,
} from '../types'
import {AwsScannerLifecycleHook} from '../types'

// get rate limiter function for global and regional scanners
export type GetRateLimiterFunction = (service: AllSupportedAwsServices, region?: string) => RateLimiter

// every scanner needs to know the credentials, rate limiter, and hooks
export interface CreateScannerOptions {
	credentials: AwsCredentials
	hooks: AwsScannerLifecycleHook<AwsSupportedResources>[]
	getRateLimiter: GetRateLimiterFunction
}

export type CreateRegionalResourceScannerFunction = <T extends AwsSupportedResources>(
	service: T,
	scanFunction: AwsRegionalScanFunction<T>,
	regions: string[],
	options: CreateScannerOptions,
) => AwsScanner<AwsResourcesList<T>>

export type CreateGlobalResourceScannerFunction = <T extends AwsSupportedResources>(
	service: T,
	scanFunction: AwsGlobalScanFunction<T>,
	options: CreateScannerOptions,
) => AwsScanner<AwsResourcesList<T>>

// Scanner config
export type AwsResourceScannerConfig<T extends AwsSupportedResources> =
	| {
			service: T
			global: true
			handler: AwsGlobalScanFunction<T>
	  }
	| {
			service: T
			global?: false
			handler: AwsRegionalScanFunction<T>
	  }

// Get the scanners for AWS services
interface GetAwsScannerArgumentsBase<T extends AllSupportedAwsServices> {
	credentials?: AwsCredentials
	getRateLimiter: GetRateLimiterFunction
	hooks?: AwsScannerLifecycleHook<T>[]
}

export interface GetAwsResourceScannerArguments<T extends AwsSupportedResources> extends GetAwsScannerArgumentsBase<T> {
	service: T
	regions?: string[]
}

export interface GetAllAwsResourceScannersArguments extends GetAwsScannerArgumentsBase<AwsSupportedResources> {
	shouldIncludeGlobalServices: boolean
	regions: string[]
}

export interface GetAwsTagsScannerArguments
	extends GetAwsScannerArgumentsBase<AwsSupportedManagementServices.RESOURCE_GROUP_TAGGING> {
	services: AwsSupportedResources[]
}
