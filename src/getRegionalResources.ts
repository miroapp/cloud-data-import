import { Resources } from "./types";

import { getAutoScalingResources } from "./resources/autoscaling";
import { getDynamoDBResources } from "./resources/dynamodb";
import { getEC2Resources } from "./resources/ec2";
import { getRDSResources } from "./resources/rds";
import { getLambdaResources } from "./resources/lambda";
import { getEFSResources } from "./resources/efs";
import { getECSResources } from "./resources/ecs";

async function getSingleRegionResources(region: string): Promise<Resources> {
  const [
    autoscaling,
    dynamodb,
    ec2,
    ecs,
    efs,
    lambda,
    rds,
  ] = await Promise.all([
    getAutoScalingResources(region),
    getDynamoDBResources(region),
    getEC2Resources(region),
    getECSResources(region),
    getEFSResources(region),
    getLambdaResources(region),
    getRDSResources(region),
  ]);

  return {
    ...autoscaling,
    ...dynamodb,
    ...ec2,
    ...ecs,
    ...efs,
    ...lambda,
    ...rds,
  };
}

export async function getRegionalResources(regions: string[]): Promise<Resources> {
  const resources = await Promise.all(
    regions.map(region => getSingleRegionResources(region))
  );

  return resources.reduce((acc, resource) => {
    return {
      ...acc,
      ...resource,
    };
  }, {} as Resources);
}
