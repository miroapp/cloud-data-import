import { Resources, ResourceDescription, ScannerError } from "../../types";
import { scannerLogger } from "./logger";
import { CreateRegionalScannerFunction } from "./types";

type RegionScanResult<T extends ResourceDescription> = {
  region: string;
  resources: Resources<T> | null;
  error: Error | null;
};

async function scanRegion<T extends ResourceDescription>(
  region: string,
  service: string,
  scanFunction: (region: string) => Promise<Resources<T>>
): Promise<RegionScanResult<T>> {
  try {
    // Scan the region
    scannerLogger.info(service, `Scanning started`, region);
    const resources = await scanFunction(region);
    scannerLogger.success(service, `Discovered ${Object.keys(resources).length} resources`, region);
    return { region, resources, error: null };
  } catch (error) {
    scannerLogger.error(service, error as Error, region);
    return { region, resources: null, error: error as Error };
  }
}

export const createRegionalScanner: CreateRegionalScannerFunction = <T extends ResourceDescription>(
  service: string,
  fn: (region: string) => Promise<Resources<T>>,
  regions: string[]
) => {
  return async () => {
    // Scan each region in parallel
    const scanResults = await Promise.all(regions.map(region => scanRegion(region, service, fn)));

    // Combine results into a single object
    const resources = scanResults.reduce((acc, { resources }) => {
      if (resources) {
        Object.assign(acc, resources);
      }
      return acc;
    }, {} as Resources<T>);
    
    // Extract errors
    const errors: ScannerError[] = scanResults.map(({ region, error }) => {
      return error ? { service, region, message: error.message } : null;
    }).filter(Boolean) as ScannerError[];

    // Return the combined resources and errors
    return { resources, errors };
  };
}
