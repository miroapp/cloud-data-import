import {ResourceDescription, Scanner, RegionalScanFunction, GlobalScanFunction, Credentials} from '../types'
import {RateLimiter} from './common/RateLimiter'
import {ScannerLifecycleHook} from '../types'

// get rate limiter function for global and regional scanners
export type GetRateLimiterFunction = (service: string, region?: string) => RateLimiter

// every scanner needs to know the credentials, rate limiter, and hooks
interface CreateScannerOptions {
	credentials: Credentials
	hooks: ScannerLifecycleHook[]
	getRateLimiter: GetRateLimiterFunction
}

export type CreateRegionalScannerFunction = <T extends ResourceDescription>(
	service: string,
	scanFunction: RegionalScanFunction<T>,
	regions: string[],
	options: CreateScannerOptions,
) => Scanner<T>

export type CreateGlobalScannerFunction = <T extends ResourceDescription>(
	service: string,
	scanFunction: GlobalScanFunction<T>,
	options: CreateScannerOptions,
) => Scanner<T>