import { config } from './args';
import { scanAndSaveAsJson } from "./app/scan-and-save-as-json";

async function main() {
  await scanAndSaveAsJson(config);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});