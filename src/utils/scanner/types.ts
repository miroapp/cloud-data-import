import { ResourceDescription, Scanner, RegionalScanFunction, GlobalScanFunction, Credentials, Resources } from "../../types"
import { RateLimiter } from "../RateLimiter"

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

/**
 * A hook that can be used to perform actions at different stages of the scanner lifecycle.
 * 
 * The `onStart` hook is called before the scanner starts scanning resources in a service.
 * The `onComplete` hook is called after the scanner has finished scanning resources in a service.
 * The `onError` hook is called if an error occurs during the scanner's operation.
 */
export interface ScannerLifecycleHook {
    onStart?: (service: string, region?: string) => void
    onComplete?: (resources: Resources, service: string, region?: string) => void
    onError?: (error: Error, service: string, region?: string) => void
}
