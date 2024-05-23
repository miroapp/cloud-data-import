import { config } from './args';
import { scanAndSaveAsJson } from "./app/scan-and-save-as-json";

async function main() {
  // Here we can run an app of choice. Each app can interact with scanners, rate limiters, hooks, etc to create an experience.
  await scanAndSaveAsJson(config);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});