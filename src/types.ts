import type * as AutoScaling from '@aws-sdk/client-auto-scaling'
import type * as CloudTrail from '@aws-sdk/client-cloudtrail'
import type * as DynamoDB from '@aws-sdk/client-dynamodb'
import type * as EC2 from '@aws-sdk/client-ec2'
import type * as Lambda from '@aws-sdk/client-lambda'
import type * as RDS from '@aws-sdk/client-rds'
import type * as S3 from '@aws-sdk/client-s3'
import type * as ECS from '@aws-sdk/client-ecs'
import type * as EKS from '@aws-sdk/client-eks'
import type * as SNS from '@aws-sdk/client-sns'
import type * as Route53 from '@aws-sdk/client-route-53'
import type * as ELBv2 from '@aws-sdk/client-elastic-load-balancing-v2'
import type * as ELBv1 from '@aws-sdk/client-elastic-load-balancing'
import type * as CloudFront from '@aws-sdk/client-cloudfront'
import type * as EFS from '@aws-sdk/client-efs'
import type * as SQS from '@aws-sdk/client-sqs'
import type * as ElastiCache from '@aws-sdk/client-elasticache'
import type * as Redshift from '@aws-sdk/client-redshift'
import type * as CloudWatch from '@aws-sdk/client-cloudwatch'
import type * as Athena from '@aws-sdk/client-athena'

import type {AwsCredentialIdentity} from '@aws-sdk/types'
import {awsRegionIds, AwsServices} from './constants'

export type AwsRegionId = (typeof awsRegionIds)[number]

export type AwsResourceDescriptionMap = {
	[AwsServices.ATHENA_NAMED_QUERIES]: Athena.NamedQuery
	[AwsServices.AUTOSCALING_GROUPS]: AutoScaling.AutoScalingGroup
	[AwsServices.CLOUDFRONT_DISTRIBUTIONS]: CloudFront.DistributionSummary
	[AwsServices.CLOUDTRAIL_TRAILS]: CloudTrail.TrailInfo
	[AwsServices.CLOUDWATCH_METRIC_ALARMS]: CloudWatch.MetricAlarm
	[AwsServices.CLOUDWATCH_METRIC_STREAMS]: CloudWatch.MetricStreamEntry
	[AwsServices.DYNAMODB_TABLES]: DynamoDB.TableDescription
	[AwsServices.EC2_INSTANCES]: EC2.Instance
	[AwsServices.EC2_INTERNET_GATEWAYS]: EC2.InternetGateway
	[AwsServices.EC2_NAT_GATEWAYS]: EC2.NatGateway
	[AwsServices.EC2_NETWORK_ACLS]: EC2.NetworkAcl
	[AwsServices.EC2_NETWORK_INTERFACES]: EC2.NetworkInterface
	[AwsServices.EC2_ROUTE_TABLES]: EC2.RouteTable
	[AwsServices.EC2_SUBNETS]: EC2.Subnet
	[AwsServices.EC2_TRANSIT_GATEWAYS]: EC2.TransitGateway
	[AwsServices.EC2_VOLUMES]: EC2.Volume
	[AwsServices.EC2_VPC_ENDPOINTS]: EC2.VpcEndpoint
	[AwsServices.EC2_VPCS]: EC2.Vpc
	[AwsServices.EC2_VPN_GATEWAYS]: EC2.VpnGateway
	[AwsServices.ECS_CLUSTERS]: ECS.Cluster
	[AwsServices.ECS_SERVICES]: ECS.Service
	[AwsServices.ECS_TASKS]: ECS.Task
	[AwsServices.EFS_FILE_SYSTEMS]: EFS.FileSystemDescription
	[AwsServices.EKS_CLUSTERS]: EKS.Cluster
	[AwsServices.ELASTICACHE_CLUSTERS]: ElastiCache.CacheCluster
	[AwsServices.ELBV1_LOAD_BALANCERS]: ELBv1.LoadBalancerDescription
	[AwsServices.ELBV2_LOAD_BALANCERS]: ELBv2.LoadBalancer
	[AwsServices.ELBV2_TARGET_GROUPS]: ELBv2.TargetGroup
	[AwsServices.LAMBDA_FUNCTIONS]: Lambda.FunctionConfiguration
	[AwsServices.RDS_CLUSTERS]: RDS.DBCluster
	[AwsServices.RDS_INSTANCES]: RDS.DBInstance
	[AwsServices.RDS_PROXIES]: RDS.DBProxy
	[AwsServices.REDSHIFT_CLUSTERS]: Redshift.Cluster
	[AwsServices.ROUTE53_HOSTED_ZONES]: Route53.HostedZone & {
		Account: string
	}
	[AwsServices.S3_BUCKETS]: S3.Bucket & {
		Account: string
		Location: string
	}
	[AwsServices.SNS_TOPICS]: SNS.Topic
	[AwsServices.SQS_QUEUES]: NonNullable<SQS.GetQueueAttributesResult['Attributes']>
}

export type AwsResources<T extends AwsServices = AwsServices> = {
	[arn: string]: T extends keyof AwsResourceDescriptionMap
		? AwsResourceDescriptionMap[T]
		: AwsResourceDescriptionMap[keyof AwsResourceDescriptionMap]
}

export type Tags = Record<string, string | undefined>

export type AwsTags = Record<string, Tags>

export type AwsCredentials = AwsCredentialIdentity | undefined

export interface RateLimiter {
	throttle<U>(fn: () => Promise<U>): Promise<U>
	pause(): void
	resume(): void
	abort(): void
	readonly queueSize: number
	readonly isPaused: boolean
	readonly rate: number
}

export type AwsRegionalScanFunction<T extends AwsServices> = (
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
) => Promise<AwsResources<T>>

export type AwsGlobalScanFunction<T extends AwsServices> = (
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
) => Promise<AwsResources<T>>

export type AwsScannerFunction<T extends AwsServices> = AwsRegionalScanFunction<T> | AwsGlobalScanFunction<T>

export type AwsScannerError = {
	service: string
	message: string
	region?: string
}

export type AwsScannerResult<Results extends object> = {
	results: Results
	errors: AwsScannerError[]
}

/**
 * A hook that can be used to perform actions at different stages of the scanner lifecycle.
 *
 * The `onStart` hook is called before the scanner starts scanning resources in a service.
 * The `onComplete` hook is called after the scanner has finished scanning resources in a service.
 * The `onError` hook is called if an error occurs during the scanner's operation.
 */
export interface AwsScannerLifecycleHook<T extends AwsServices = AwsServices> {
	onStart?: (service: T, region?: string) => void
	onComplete?: (resources: AwsResources<T>, service: T, region?: string) => void
	onError?: (error: Error, service: T, region?: string) => void
}

export type AwsScanner<Results extends object> = () => Promise<AwsScannerResult<Results>>

export interface Config {
	regions: string[]
	profile: string | undefined
	output: string
	compressed: boolean
	raw: boolean
	'open-output-dir': boolean
	'call-rate-rps': number
	'regional-only': boolean
}

export type BaseContainer<AdditionalChildren extends Record<string, any> = {}> = {
	name: string
	children: {
		resources: string[] // resource arns
	} & AdditionalChildren
}

export type AccountContainer = BaseContainer<{
	regions: string[] // region ids
}>

export type RegionContainer = BaseContainer<{
	vpcs: string[] // vpc arns
	availabilityZones: string[] // availability zone ids
}>

export type VpcContainer = BaseContainer<{
	subnets: string[] // subnet arns
	securityGroups: string[] // security group arns
}>

export type AvailabilityZoneContainer = BaseContainer<{
	subnets: string[] // subnet arns
	securityGroups: string[] // security group arns
}>

export type SecurityGroupContainer = BaseContainer

export type SubnetContainer = BaseContainer & {
	type: 'public' | 'private'
}

export type ConnectionType = 'TBD'

export interface AwsProcessedData {
	resources: {
		[arn: string]: {
			name: string
			type: string
			tags: {[key: string]: string | undefined}
		}
	}
	connections: {
		from: string // resource arn
		to: string // resource arn
		type: ConnectionType
	}[]
	containers: {
		accounts: {[accountId: string]: AccountContainer}
		regions: {[regionId: string]: RegionContainer}
		vpcs: {[arn: string]: VpcContainer}
		availabilityZones: {[arn: string]: AvailabilityZoneContainer}
		securityGroups: {[arn: string]: SecurityGroupContainer}
		subnets: {[arn: string]: SubnetContainer}
	}
	tags: {[key: string]: string[]}
}

interface AwsScanJobMetadata {
	account: string
	regions: string[]
	startedAt: string
	finishedAt: string
}

/**
 * 💡
 * The standard schema is what Miro expects from the discovered cloud data.
 * This schema supports versioning, so any changes made to it should result in a version bump.
 *
 * A JSON schema generator creates the JSON schema based on this TypeScript type in schemas/* folder
 * You can find it in `scripts/generate-json-schema.ts`.
 */

/**
 * Miro's Standard Schema for AWS resources.
 */
export interface AwsStandardSchema {
	provider: 'aws'
	docVersion: '0.1.2' // Version of the schema. Should be bumped when schema changes.
	resources: AwsResourceDescriptionMap[keyof AwsResourceDescriptionMap]
	tags: AwsTags
	errors: AwsScannerError[]
	metadata?: AwsScanJobMetadata
}

export interface AwsCliAppOutput extends AwsStandardSchema {
	processed?: AwsProcessedData
}
