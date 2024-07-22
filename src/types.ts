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

import type {RateLimiter} from './scanners/common/RateLimiter'
import type {AwsCredentialIdentity} from '@aws-sdk/types'

export type SQSQueue = NonNullable<SQS.GetQueueAttributesResult['Attributes']>

export type ResourceDescription =
	| AutoScaling.AutoScalingGroup
	| S3.Bucket
	| CloudFront.DistributionSummary
	| CloudWatch.MetricAlarm
	| CloudWatch.MetricStreamEntry
	| EKS.Cluster
	| RDS.DBInstance
	| RDS.DBCluster
	| RDS.DBProxy
	| Lambda.FunctionConfiguration
	| EFS.FileSystemDescription
	| EC2.Instance
	| EC2.InternetGateway
	| EC2.NatGateway
	| EC2.RouteTable
	| EC2.Vpc
	| EC2.VpcEndpoint
	| EC2.NetworkAcl
	| EC2.Subnet
	| EC2.Volume
	| EC2.TransitGateway
	| CloudTrail.TrailInfo
	| DynamoDB.TableDescription
	| ECS.Cluster
	| ECS.Service
	| ECS.Task
	| SNS.Topic
	| ELBv1.LoadBalancerDescription
	| ELBv2.LoadBalancer
	| ELBv2.TargetGroup
	| ElastiCache.CacheCluster
	| Redshift.Cluster
	| Route53.HostedZone
	| SQSQueue

export type Resources<T extends ResourceDescription = ResourceDescription> = {
	[arn: string]: T
}

export type Credentials = AwsCredentialIdentity | undefined

export type RegionalScanFunction<T extends ResourceDescription> = (
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
) => Promise<Resources<T>>
export type GlobalScanFunction<T extends ResourceDescription> = (
	credentials: Credentials,
	rateLimiter: RateLimiter,
) => Promise<Resources<T>>

export type ScannerFunction<T extends ResourceDescription> = RegionalScanFunction<T> | GlobalScanFunction<T>

export type ScannerError = {
	service: string
	message: string
	region?: string
}

export type ScannerResult<T extends ResourceDescription> = {
	resources: Resources<T>
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
	regions: string[]
	output: string
	compressed: boolean
	raw: boolean
	'open-output-dir': boolean
	'call-rate-rps': number
	'regional-only': boolean
}

export type ProcessedResource = {
	name: string
	region?: string
	type: string
	vpc?: string
	availabilityZones?: string[]
	account?: string
}

export interface ProcessedData {
	resources: {
		[arn: string]: ProcessedResource
	}
}

export interface StandardOutputSchema {
	provider: 'aws'
	docVersion: string
	resources: Resources
	processed: ProcessedData
	errors: ScannerError[]
	metadata: {
		account: string
		regions: string[]
		startedAt: string
		finishedAt: string
	}
}
