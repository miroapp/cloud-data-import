import { ResourceDescription, Scanner, RegionalScanFunction, GlobalScanFunction, Credentials } from "../../types"
import { RateLimiter } from "../RateLimiter"

export type GetRegionalRateLimiterFunction = (service: string, region: string) => RateLimiter
export type GetGlobalRateLimiterFunction = (service: string) => RateLimiter
export type GetRateLimiterFunction = GetRegionalRateLimiterFunction | GetGlobalRateLimiterFunction

export type CreateRegionalScannerFunction = <T extends ResourceDescription>(
    service: string,
    scanFunction: RegionalScanFunction<T>,
    regions: string[],
    credentials: Credentials,
    getRateLimiter: GetRegionalRateLimiterFunction,
    hooks: ScannerLifecycleHook[],
) => Scanner<T>

export type CreateGlobalScannerFunction = <T extends ResourceDescription>(
    service: string,
    scanFunction: GlobalScanFunction<T>,
    credentials: Credentials,
    getRateLimiter: GetGlobalRateLimiterFunction,
    hooks: ScannerLifecycleHook[],
) => Scanner<T>

export interface ScannerLifecycleHook {
    onStart: (service: string, region?: string) => void
    onComplete: (data: ResourceDescription, service: string, region?: string) => void
    onError: (error: Error, service: string, region?: string) => void
}
