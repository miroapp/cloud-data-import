import { GlobalResources, OutputSchema, RegionalResources } from "./types";
import { saveAsJson } from "./utils/saveAsJson";

import { getAutoScalingResources } from "./resources/autoscaling";
import { getCloudTrailResources } from "./resources/cloudtrail";
import { getDynamoDBResources } from "./resources/dynamodb";
import { getEC2Resources } from "./resources/ec2";
import { getRDSResources } from "./resources/rds";
import { getLambdaResources } from "./resources/lambda";
import { getS3Resources } from "./resources/s3";

async function getRegionalResources(region: string): Promise<RegionalResources> {
  const [
    autoscaling,
    dynamodb,
    ec2,
    lambda,
    rds,
  ] = await Promise.all([
    getAutoScalingResources(),
    getDynamoDBResources(),
    getEC2Resources(),
    getLambdaResources(),
    getRDSResources(),
  ]);

  return {
    autoscaling,
    dynamodb,
    ec2,
    lambda,
    rds,
  };
}

async function getGlobalResources(): Promise<GlobalResources> {
  const [
    cloudtrail,
    s3,
  ] = await Promise.all([
    getCloudTrailResources(),
    getS3Resources(),
  ]);

  return {
    cloudtrail,
    s3,
  };
}


async function getOutput(): Promise<OutputSchema> {
  return {
    versionId: '0.0.1',
    regions: {
      'us-east-1': {
        resources: await getRegionalResources('us-east-1'),
      },
    },
    global: {
      resources: await getGlobalResources(),
    },
  }
}

async function main() {
  const output = await getOutput();
  saveAsJson('./output.json', output);
}

main();