import { OutputSchema } from "./types";
import { saveAsJson } from "./utils/saveAsJson";

import { getAutoScalingResources } from "./resources/autoscaling";
import { getCloudTrailResources } from "./resources/cloudtrail";
import { getDynamoDBResources } from "./resources/dynamodb";
import { getEC2Resources } from "./resources/ec2";
import { getRDSResources } from "./resources/rds";
import { getLambdaResources } from "./resources/lambda";
import { getS3Resources } from "./resources/s3";

async function getOutput(): Promise<OutputSchema> {
  return {
    versionId: '0.0.1',
    resources: {
      autoscaling: await getAutoScalingResources(),
      cloudtrail: await getCloudTrailResources(),
      dynamodb: await getDynamoDBResources(),
      ec2: await getEC2Resources(),
      lambda: await getLambdaResources(),
      rds: await getRDSResources(),
      s3: await getS3Resources()
    }
  };
}

async function main() {
  const output = await getOutput();
  saveAsJson('./output.json', output);
}

main();