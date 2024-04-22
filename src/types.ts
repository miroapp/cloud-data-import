export interface AutoScalingSchema {
    groups: object[]
}

export interface CloudTrailSchema {
    trails: object[]
}

export interface DynamoDBSchema {
    tables: object[]
}

export interface EC2Schema {
    instances: object[]
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

export interface OutputSchema {
    versionId: '0.0.1',
    resources: {
        autoscaling: AutoScalingSchema,
        cloudtrail: CloudTrailSchema,
        dynamodb: DynamoDBSchema,
        ec2: EC2Schema,
        lambda: LambdaSchema,
        rds: RDSSchema,
        s3: S3Schema
    }
}