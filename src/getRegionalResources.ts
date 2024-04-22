import { OutputSchema, RegionalResources } from "./types";

import { getAutoScalingResources } from "./resources/autoscaling";
import { getDynamoDBResources } from "./resources/dynamodb";
import { getEC2Resources } from "./resources/ec2";
import { getRDSResources } from "./resources/rds";
import { getLambdaResources } from "./resources/lambda";

async function getSingleRegionResources(region: string): Promise<OutputSchema['regions'][string]> {
  const [
    autoscaling,
    dynamodb,
    ec2,
    lambda,
    rds,
  ] = await Promise.all([
    getAutoScalingResources(region),
    getDynamoDBResources(region),
    getEC2Resources(region),
    getLambdaResources(region),
    getRDSResources(region),
  ]);

  return {
    resources: {
      autoscaling,
      dynamodb,
      ec2,
      lambda,
      rds,
    }
  };
}

export async function getRegionalResources(regions: string[]): Promise<OutputSchema['regions']> {
  const resources = await Promise.all(
    regions.map(region => getSingleRegionResources(region))
  );

  return resources.reduce((acc, resources, index) => {
    acc[regions[index]] = resources;
    return acc;
  }, {} as { [region: string]: { resources: RegionalResources }});
}
