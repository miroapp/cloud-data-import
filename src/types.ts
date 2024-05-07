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
    Volumes?: EC2.Volume[];
    Vpc?: EC2.Vpc;
    Subnet?: EC2.Subnet;
    SecurityGroups?: EC2.SecurityGroup[];
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

export type ScannerError = {
    service: string,
    message: string
    region?: string,
}

export type ScannerResult<T extends ResourceDescription> = {
    resources: Resources<T>,
    errors: ScannerError[]
}

export type Scanner<T extends ResourceDescription = ResourceDescription> = () => Promise<ScannerResult<T>>

export interface OutputSchema {
    docVersion: '0.0.1',
    resources: Resources,
    errors: ScannerError[],
    metadata: {
        startedAt: string,
        finishedAt: string
    }
}