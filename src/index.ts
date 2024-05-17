import { config } from './args';
import { scanAndSaveAsJson } from "./app/scan-and-save-as-json";
import { getScanners } from "./scanners";

async function main() {
  const regions = config.regions;
  const outputFilePath = config.output;
  const isCompressed = config.compressed;
  const shouldIncludeGlobalServices = !config['regional-only'];

  const scanners = getScanners(regions, shouldIncludeGlobalServices);
  await scanAndSaveAsJson(scanners, outputFilePath, isCompressed);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});