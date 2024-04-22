import { OutputSchema } from './types';
import { saveAsJson } from "./utils/saveAsJson";
import { getGlobalResources } from './getGlobalResources';
import { getRegionalResources } from './getRegionalResources';


async function getOutput(): Promise<OutputSchema> {
  const startedAt = new Date().toISOString();

  const [regionalResources, globalResources] = await Promise.all([
    getRegionalResources(['eu-west-1', 'us-east-1']),
    getGlobalResources(),
  ]);

  const finishedAt = new Date().toISOString();

  return {
    docVersion: '0.0.1',
    regions: regionalResources,
    global: globalResources,
    job: {
      startedAt,
      finishedAt,
    },
  }
}

async function main() {
  const output = await getOutput();
  saveAsJson('./output.json', output);
}

main();