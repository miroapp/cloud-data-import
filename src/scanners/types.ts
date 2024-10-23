import {AwsServices} from '@/constants'
import {AwsScanner, AwsRegionalScanFunction, AwsGlobalScanFunction, AwsCredentials, RateLimiter} from '../types'
import {AwsScannerLifecycleHook} from '../types'

// get rate limiter function for global and regional scanners
export type GetRateLimiterFunction = (service: string, region?: string) => RateLimiter

// every scanner needs to know the credentials, rate limiter, and hooks
export interface CreateScannerOptions {
	credentials: AwsCredentials
	hooks: AwsScannerLifecycleHook[]
	getRateLimiter: GetRateLimiterFunction
	tagsRateLimiter: RateLimiter
}

export type CreateRegionalScannerFunction = <T extends AwsServices>(
	service: T,
	scanFunction: AwsRegionalScanFunction<T>,
	regions: string[],
	options: CreateScannerOptions,
) => AwsScanner<T>

export type CreateGlobalScannerFunction = <T extends AwsServices>(
	service: T,
	scanFunction: AwsGlobalScanFunction<T>,
	options: CreateScannerOptions,
) => AwsScanner<T>

// Scanner config
export type AwsScannerConfig<T extends AwsServices> =
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
interface GetAwsScannerArgumentsBase {
	credentials?: AwsCredentials
	getRateLimiter: GetRateLimiterFunction
	hooks?: AwsScannerLifecycleHook[]
	regions: string[]
}

export interface GetAwsScannerArguments<T extends AwsServices> extends GetAwsScannerArgumentsBase {
	service: T
}

export interface GetAllAwsScannersArguments extends GetAwsScannerArgumentsBase {
	shouldIncludeGlobalServices: boolean
}
