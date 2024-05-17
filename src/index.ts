import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { scanAndSaveAsJson } from "./app/scan-and-save-as-json";
import { getScanners } from "./scanners";

// List of valid AWS regions
const validRegions = [
  'us-east-1', 'us-west-1', 'us-west-2', 'af-south-1', 'ap-east-1', 'ap-south-1',
  'ap-northeast-1', 'ap-northeast-2', 'ap-northeast-3', 'ap-southeast-1', 'ap-southeast-2',
  'ca-central-1', 'cn-north-1', 'cn-northwest-1', 'eu-central-1', 'eu-west-1', 'eu-west-2',
  'eu-west-3', 'eu-north-1', 'eu-south-1', 'me-south-1', 'sa-east-1'
];

// Define the CLI arguments with explicit typing
const argv = yargs(hideBin(process.argv))
  .option('regions', {
    alias: 'r',
    type: 'array',
    description: 'List of regions to scan',
    demandOption: true,
    coerce: (arg: string[]) => {
      arg.forEach(region => {
        if (!validRegions.includes(region)) {
          throw new Error(`Invalid region: ${region}. Valid regions are: ${validRegions.join(', ')}`);
        }
      });
      return arg;
    }
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Output file path (must be .json)',
    demandOption: true,
    coerce: (arg: string) => {
      if (!arg.endsWith('.json')) {
        throw new Error('Output file must have a .json extension');
      }
      return arg;
    }
  })
  .option('compressed', {
    alias: 'c',
    type: 'boolean',
    description: 'Compress the output',
    default: false
  })
  .option('regional-only', {
    alias: 'ro',
    type: 'boolean',
    description: 'Only scan regional services and ignore global services',
    default: false
  })
  .strict()
  .argv as unknown as {
    regions: string[];
    output: string;
    compressed: boolean;
    'regional-only': boolean;
  };

async function main() {
  const regions = argv.regions;
  const outputFilePath = argv.output;
  const isCompressed = argv.compressed;
  const regionalOnly = argv['regional-only'];
  
  const shouldIncludeGlobalServices = !regionalOnly;

  const scanners = getScanners(regions, shouldIncludeGlobalServices)
  await scanAndSaveAsJson(scanners, outputFilePath, isCompressed);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});