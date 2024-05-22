import { Credentials, Scanner } from "./types";
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
import { RateLimiter } from "./utils/RateLimiter";

export const getScanners = (regions: string[], shouldIncludeGlobalServices: boolean): Scanner[] => {
    const credentials: Credentials = {};
    const getRateLimiter = () => new RateLimiter(1);

    const scanners: Scanner[] = [
        createRegionalScanner('autoscaling', getAutoScalingResources, regions, credentials, getRateLimiter),
        createRegionalScanner('dynamodb', getDynamoDBResources, regions, credentials, getRateLimiter),
        createRegionalScanner('ec2', getEC2Resources, regions, credentials, getRateLimiter),
        createRegionalScanner('ecs', getECSResources, regions, credentials, getRateLimiter),
        createRegionalScanner('efs', getEFSResources, regions, credentials, getRateLimiter),
        createRegionalScanner('eks', getEKSResources, regions, credentials, getRateLimiter),
        createRegionalScanner('lambda', getLambdaResources, regions, credentials, getRateLimiter),
        createRegionalScanner('rds', getRDSResources, regions, credentials, getRateLimiter),
    ];

    if (shouldIncludeGlobalServices) {
        scanners.push(
            createGlobalScanner('cloudfront', getCloudFrontResources, credentials, getRateLimiter),
            createGlobalScanner('cloudtrail', getCloudTrailResources, credentials, getRateLimiter),
            createGlobalScanner('s3', getS3Resources, credentials, getRateLimiter)
        );
    }

    return scanners;
};