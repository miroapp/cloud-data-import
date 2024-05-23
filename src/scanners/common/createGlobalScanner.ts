import { Resources, ResourceDescription, GlobalScanFunction, Credentials, ScannerLifecycleHook } from "../../types";
import { RateLimiter } from "../../RateLimiter";
import { CreateGlobalScannerFunction, GetGlobalRateLimiterFunction } from "../types";

type GlobalScanResult<T extends ResourceDescription> = {
  resources: Resources<T>;
  error: Error | null;
};

async function performGlobalScan<T extends ResourceDescription>(
  service: string,
  scanFunction: GlobalScanFunction<T>,
  credentials: Credentials,
  rateLimiter: RateLimiter,
  hooks: ScannerLifecycleHook[]
): Promise<GlobalScanResult<T>> {
  try {
    // onStart hook
    hooks.forEach((hook) => hook.onStart?.(service));

    // Perform scan
    const resources = await scanFunction(credentials, rateLimiter);

    // onComplete hook
    hooks.forEach((hook) => hook.onComplete?.(resources, service));

    // Return resources
    return { resources, error: null };
  } catch (error) {

    // onError hook
    hooks.forEach((hook) => hook.onError?.(error as Error, service));

    // Return error
    return { resources: {} as Resources<never>, error: error as Error };
  }
}

export const createGlobalScanner: CreateGlobalScannerFunction = <T extends ResourceDescription>(
  service: string,
  scanFunction: GlobalScanFunction<T>,
  options: {
    credentials: Credentials,
    getRateLimiter: GetGlobalRateLimiterFunction,
    hooks: ScannerLifecycleHook[],
  }
) => {
  return async () => {
    const { credentials, getRateLimiter, hooks } = options;

    // Perform global scan
    const rateLimiter = getRateLimiter(service);
    const { resources, error } = await performGlobalScan(service, scanFunction, credentials, rateLimiter, hooks);

    // Return resources and errors
    return {
      resources,
      errors: error ? [{ service, message: error.message }] : [],
    };
  };
}
