import { ResourceDescription, Scanner, RegionalScanFunction, GlobalScanFunction, Credentials } from "../types"
import { RateLimiter } from "../RateLimiter"
import { ScannerLifecycleHook } from "../types"

// getRateLimiter function types
export type GetRegionalRateLimiterFunction = (service: string, region: string) => RateLimiter
export type GetGlobalRateLimiterFunction = (service: string) => RateLimiter

// every scanner needs to know the credentials, rate limiter, and hooks
interface CreateScannerOptions {
    credentials: Credentials
    hooks: ScannerLifecycleHook[]
}

export type CreateRegionalScannerFunction = <T extends ResourceDescription>(
    service: string,
    scanFunction: RegionalScanFunction<T>,
    regions: string[],
    options: CreateScannerOptions & { getRateLimiter: GetRegionalRateLimiterFunction },
) => Scanner<T>

export type CreateGlobalScannerFunction = <T extends ResourceDescription>(
    service: string,
    scanFunction: GlobalScanFunction<T>,
    options: CreateScannerOptions & { getRateLimiter: GetGlobalRateLimiterFunction },
) => Scanner<T>
