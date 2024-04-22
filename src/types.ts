import type * as DynamoDB from "@aws-sdk/client-dynamodb"
import type * as EC2 from "@aws-sdk/client-ec2"

export interface AutoScalingSchema {
    groups: object[]
}

export interface CloudTrailSchema {
    trails: object[]
}

export interface DynamoDBSchema {
    tables: DynamoDB.TableDescription[]
}

export interface EC2Schema {
    instances: EC2.Instance[]
}

export interface LambdaSchema {
    functions: object[]
}

export interface RDSSchema {
    instances: object[]
    clusters: object[]
}

export interface S3Schema {
    buckets: object[]
}

export interface RegionalResources {
    autoscaling: AutoScalingSchema,
    dynamodb: DynamoDBSchema,
    ec2: EC2Schema,
    lambda: LambdaSchema,
    rds: RDSSchema,
}

export interface GlobalResources {
    cloudtrail: CloudTrailSchema
    s3: S3Schema
}

export interface OutputSchema {
    versionId: '0.0.1',
    regions: {
        [region: string]: {
            resources: RegionalResources
        }
    },
    global: {
        resources: GlobalResources
    },
    job: {
        startedAt: string,
        finishedAt: string,
    }
}