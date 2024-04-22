import { writeFileSync } from "fs";
import { OutputSchema } from "./types";

async function main() {
  const output: OutputSchema = {
    versionId: '0.0.1',
    resources: {
      autoscaling: {
        groups: []
      },
      cloudtrail: {
        trails: []
      },
      dynamodb: {
        tables: []
      },
      ec2: {
        instances: []
      },
      lambda: {
        functions: []
      },
      rds: {
        instances: [],
        clusters: []
      },
      s3: {
        buckets: []
      }
    }
  };

  // Write the output to a JSON file
  writeFileSync('output.json', JSON.stringify(output, null, 2));
}

main();