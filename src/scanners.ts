import { Scanner } from "./types";
import { createGlobalScanner, createRegionalScanner } from "./utils/scanner";

import { getAutoScalingResources } from "./resources/autoscaling";
import { getCloudFrontResources } from "./resources/cloudfront";
import { getCloudTrailResources } from "./resources/cloudtrail";
import { getDynamoDBResources } from "./resources/dynamodb";
import { getEC2Resources } from "./resources/ec2";
import { getECSResources } from "./resources/ecs";
import { getEFSResources } from "./resources/efs";
import { getEKSResources } from "./resources/eks";
import { getLambdaResources } from "./resources/lambda";
import { getRDSResources } from "./resources/rds";
import { getS3Resources } from "./resources/s3";

export const getScanners = (regions: string[], shouldIncludeGlobalServices: boolean): Scanner[] => {
    const scanners: Scanner[] = [
        createRegionalScanner('autoscaling', getAutoScalingResources, regions),
        createRegionalScanner('dynamodb', getDynamoDBResources, regions),
        createRegionalScanner('ec2', getEC2Resources, regions),
        createRegionalScanner('ecs', getECSResources, regions),
        createRegionalScanner('efs', getEFSResources, regions),
        createRegionalScanner('eks', getEKSResources, regions),
        createRegionalScanner('lambda', getLambdaResources, regions),
        createRegionalScanner('rds', getRDSResources, regions),
    ];

    if (shouldIncludeGlobalServices) {
        scanners.push(
            createGlobalScanner('cloudfront', getCloudFrontResources),
            createGlobalScanner('cloudtrail', getCloudTrailResources),
            createGlobalScanner('s3', getS3Resources)
        );
    }

    return scanners;
};