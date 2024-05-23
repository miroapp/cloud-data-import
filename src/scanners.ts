import { Credentials, Scanner } from "./types";
import { createGlobalScanner, createRegionalScanner, ScannerLifecycleHook } from "./utils/scanner";

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

export const getScanners = (regions: string[], shouldIncludeGlobalServices: boolean, hooks: ScannerLifecycleHook[]): Scanner[] => {
    const credentials: Credentials = {}; // Use the already assumed role in current terminal session
    const getRateLimiter = () => new RateLimiter(10);

    const scanners: Scanner[] = [
        createRegionalScanner('autoscaling', getAutoScalingResources, regions, credentials, getRateLimiter, hooks),
        createRegionalScanner('dynamodb', getDynamoDBResources, regions, credentials, getRateLimiter, hooks),
        createRegionalScanner('ec2', getEC2Resources, regions, credentials, getRateLimiter, hooks),
        createRegionalScanner('ecs', getECSResources, regions, credentials, getRateLimiter, hooks),
        createRegionalScanner('efs', getEFSResources, regions, credentials, getRateLimiter, hooks),
        createRegionalScanner('eks', getEKSResources, regions, credentials, getRateLimiter, hooks),
        createRegionalScanner('lambda', getLambdaResources, regions, credentials, getRateLimiter, hooks),
        createRegionalScanner('rds', getRDSResources, regions, credentials, getRateLimiter, hooks),
    ];

    if (shouldIncludeGlobalServices) {
        scanners.push(
            createGlobalScanner('cloudfront', getCloudFrontResources, credentials, getRateLimiter, hooks),
            createGlobalScanner('cloudtrail', getCloudTrailResources, credentials, getRateLimiter, hooks),
            createGlobalScanner('s3', getS3Resources, credentials, getRateLimiter, hooks)
        );
    }

    return scanners;
};