import { AutoScalingGroup } from "@aws-sdk/client-auto-scaling"
import { Trail } from "@aws-sdk/client-cloudtrail"
import { TableDescription } from "@aws-sdk/client-dynamodb"
import { Instance } from "@aws-sdk/client-ec2"
import { FunctionConfiguration } from "@aws-sdk/client-lambda"
import { DBCluster, DBInstance } from "@aws-sdk/client-rds"
import { Bucket } from "@aws-sdk/client-s3"

export type ResourceDescription =
    | AutoScalingGroup
    | Bucket
    | DBInstance
    | DBCluster
    | FunctionConfiguration
    | Instance
    | Trail
    | TableDescription

export type Resources<T extends ResourceDescription = ResourceDescription> = {
    [arn: string]: T
}

export type ResourceDiscoveryError = {
    sourceArn: string,
    status: number,
    message: string
}

export interface OutputSchema {
    docVersion: '0.0.1',
    resources: Resources,
    metadata: {
        errors: ResourceDiscoveryError[],
        startedAt: string,
        finishedAt: string
    }
}