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
    getDynamoDBResources(region),
    getEC2Resources(region),
    getLambdaResources(region),
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
  const startedAt = new Date().toISOString();

  return {
    versionId: '0.0.1',
    regions: {
      'eu-west-1': {
        resources: await getRegionalResources('eu-west-1'),
      },
    },
    global: {
      resources: await getGlobalResources(),
    },
    job: {
      startedAt,
      finishedAt: new Date().toISOString(),
    },
  }
}

async function main() {
  const output = await getOutput();
  saveAsJson('./output.json', output);
}

main();