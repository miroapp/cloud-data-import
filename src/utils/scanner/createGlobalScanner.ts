import { Resources, ResourceDescription, ScannerError, GlobalScanFunction, Credentials } from "../../types";
import { RateLimiter } from "../RateLimiter";
import { scannerLogger } from "./logger";
import { CreateGlobalScannerFunction, GetGlobalRateLimiterFunction } from "./types";

type GlobalScanResult<T extends ResourceDescription> = {
  resources: Resources<T>;
  error: Error | null;
};

async function performGlobalScan<T extends ResourceDescription>(
  service: string,
  scanFunction: GlobalScanFunction<T>,
  credentials: Credentials,
  rateLimiter: RateLimiter
): Promise<GlobalScanResult<T>> {
  try {
    // Scan the service globally
    scannerLogger.success(service, `Scanning started`);
    const resources = await scanFunction(credentials, rateLimiter);
    scannerLogger.success(service, `Discovered ${Object.keys(resources).length} resources globally`);
    return { resources, error: null };
  } catch (error) {
    scannerLogger.error(service, error as Error);
    return { resources: {} as Resources<never>, error: error as Error };
  }
}

export const createGlobalScanner: CreateGlobalScannerFunction = <T extends ResourceDescription>(
  service: string,
  scanFunction: GlobalScanFunction<T>,
  credentials: Credentials,
  getRateLimiter: GetGlobalRateLimiterFunction
) => {
  return async () => {
    const rateLimiter = getRateLimiter(service);
    const { resources, error } = await performGlobalScan(service, scanFunction, credentials, rateLimiter);
    const errors = error ? [{ service, message: error.message }] : [];
    return { resources, errors };
  };
}
