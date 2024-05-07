import { Resources, ResourceDescription, ScannerError } from "../../types";
import { scannerLogError, scannerLogSuccess } from "./logger";

type GlobalScanResult<T extends ResourceDescription> = {
  resources: Resources<T>;
  error: Error | null;
};

async function performGlobalScan<T extends ResourceDescription>(
  service: string,
  scanFunction: () => Promise<Resources<T>>
): Promise<GlobalScanResult<T>> {
  try {
    // Scan the service globally
    scannerLogSuccess(service, `Scanning started`);
    const resources = await scanFunction();
    scannerLogSuccess(service, `Discovered ${Object.keys(resources).length} resources globally`);
    return { resources, error: null };
  } catch (error) {
    scannerLogError(service, error as Error);
    return { resources: {} as Resources<never>, error: error as Error };
  }
}

export function createGlobalScanner<T extends ResourceDescription>(
  service: string,
  fn: () => Promise<Resources<T>>
): () => Promise<{ resources: Resources<T>; errors: ScannerError[] }> {
  return async () => {
    const { resources, error } = await performGlobalScan(service, fn);
    const errors = error ? [{ service, message: error.message }] : [];
    return { resources, errors };
  };
}
