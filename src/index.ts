import { scanAndSaveAsJson } from "./app/scan-and-save-as-json";
import { getScanners } from "./scanners";

async function main() {
  const scanners = getScanners(['eu-west-1', 'us-east-1'])
  scanAndSaveAsJson(scanners, './output.json')
}

main();