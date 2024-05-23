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
    const options = {
        // For now, we are using an empty object for credentials. This is because we are assuming the role in the terminal session.
        credentials: {},
        // For now, we are using a single dummy rate limiter for all scanners. It is 10 requests per second.
        getRateLimiter: () => new RateLimiter(10),
        // Pass the hooks to the scanners so that they can call the appropriate lifecycle hooks at the right time.
        hooks
    };

    // Regional scanners
    const scanners: Scanner[] = [
        createRegionalScanner('autoscaling', getAutoScalingResources, regions, options),
        createRegionalScanner('dynamodb', getDynamoDBResources, regions, options),
        createRegionalScanner('ec2', getEC2Resources, regions, options),
        createRegionalScanner('ecs', getECSResources, regions, options),
        createRegionalScanner('efs', getEFSResources, regions, options),
        createRegionalScanner('eks', getEKSResources, regions, options),
        createRegionalScanner('lambda', getLambdaResources, regions, options),
        createRegionalScanner('rds', getRDSResources, regions, options),
    ];

    // Global scanners
    if (shouldIncludeGlobalServices) {
        scanners.push(
            createGlobalScanner('cloudfront', getCloudFrontResources, options),
            createGlobalScanner('cloudtrail', getCloudTrailResources, options),
            createGlobalScanner('s3', getS3Resources, options)
        );
    }

    return scanners;
};