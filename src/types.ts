import { AutoScalingGroup } from "@aws-sdk/client-auto-scaling"
import { Trail } from "@aws-sdk/client-cloudtrail"
import { TableDescription } from "@aws-sdk/client-dynamodb"
import * as EC2 from "@aws-sdk/client-ec2"
import { FunctionConfiguration } from "@aws-sdk/client-lambda"
import { DBCluster, DBInstance } from "@aws-sdk/client-rds"
import * as S3 from "@aws-sdk/client-s3"
import * as ECS from "@aws-sdk/client-ecs"
import * as EKS from "@aws-sdk/client-eks"
import {
    FileSystemDescription,
    FileSystemPolicyDescription,
    LifecycleConfigurationDescription,
    MountTargetDescription,
} from "@aws-sdk/client-efs";
import {
    DistributionSummary,
    DistributionConfig,
    Tags
} from "@aws-sdk/client-cloudfront";
import { RateLimiter } from "./scanners/common/RateLimiter"
import { Credentials as STSCredentials } from '@aws-sdk/client-sts';

export interface ExtendedCloudFrontDistribution extends DistributionSummary {
    DistributionConfig?: DistributionConfig;
    Tags?: Tags;
}

export interface ExtendedFileSystem extends FileSystemDescription {
    Policy?: FileSystemPolicyDescription;
    LifecycleConfiguration?: LifecycleConfigurationDescription;
    MountTargets?: MountTargetDescription[];
}

export interface ExtendedBucket extends S3.Bucket {
    CreationDate?: Date;
    LocationConstraint?: string;
    ARN: string;
    Policy?: string;
    Versioning?: string;
    Encryption?: S3.ServerSideEncryptionConfiguration;
    Tagging?: S3.Tag[];
}

export interface ExtendedInstance extends EC2.Instance {
    ARN: string;
}

export type ResourceDescription =
    | AutoScalingGroup
    | ExtendedBucket
    | ExtendedCloudFrontDistribution
    | EKS.Cluster
    | DBInstance
    | DBCluster
    | FunctionConfiguration
    | ExtendedFileSystem
    | ExtendedInstance
    | Trail
    | TableDescription
    | ECS.Cluster | ECS.Service | ECS.Task

export type Resources<T extends ResourceDescription = ResourceDescription> = {
    [arn: string]: T
}

export type Credentials = STSCredentials | {}

export type RegionalScanFunction<T extends ResourceDescription> = (credentials: Credentials, rateLimiter: RateLimiter, region: string) => Promise<Resources<T>>
export type GlobalScanFunction<T extends ResourceDescription> = (credentials: Credentials, rateLimiter: RateLimiter) => Promise<Resources<T>>

export type ScannerFunction<T extends ResourceDescription> = RegionalScanFunction<T> | GlobalScanFunction<T>

export type ScannerError = {
    service: string,
    message: string
    region?: string,
}

export type ScannerResult<T extends ResourceDescription> = {
    resources: Resources<T>,
    errors: ScannerError[]
}

/**
 * A hook that can be used to perform actions at different stages of the scanner lifecycle.
 * 
 * The `onStart` hook is called before the scanner starts scanning resources in a service.
 * The `onComplete` hook is called after the scanner has finished scanning resources in a service.
 * The `onError` hook is called if an error occurs during the scanner's operation.
 */
export interface ScannerLifecycleHook {
    onStart?: (service: string, region?: string) => void
    onComplete?: (resources: Resources, service: string, region?: string) => void
    onError?: (error: Error, service: string, region?: string) => void
}

export type Scanner<T extends ResourceDescription = ResourceDescription> = () => Promise<ScannerResult<T>>

export interface Config {
    regions: string[];
    output: string;
    compressed: boolean;
    'regional-only': boolean;
}

export interface StandardOutputSchema {
    provider: 'aws',
    docVersion: '0.0.1',
    resources: Resources,
    errors: ScannerError[],
    metadata: {
        startedAt: string,
        finishedAt: string
    }
}