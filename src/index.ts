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
  const [
    autoscaling,
    cloudtrail,
    dynamodb,
    ec2,
    lambda,
    rds,
    s3
  ] = await Promise.all([
    getAutoScalingResources(),
    getCloudTrailResources(),
    getDynamoDBResources(),
    getEC2Resources(),
    getLambdaResources(),
    getRDSResources(),
    getS3Resources()
  ]);

  return {
    versionId: '0.0.1',
    resources: {
      autoscaling,
      cloudtrail,
      dynamodb,
      ec2,
      lambda,
      rds,
      s3
    }
  };
}

async function main() {
  const output = await getOutput();
  saveAsJson('./output.json', output);
}

main();