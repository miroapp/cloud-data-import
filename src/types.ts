import type {AutoScalingGroup} from '@aws-sdk/client-auto-scaling'
import type {Trail} from '@aws-sdk/client-cloudtrail'
import type {TableDescription} from '@aws-sdk/client-dynamodb'
import type * as EC2 from '@aws-sdk/client-ec2'
import type {FunctionConfiguration} from '@aws-sdk/client-lambda'
import type {DBCluster, DBInstance} from '@aws-sdk/client-rds'
import type * as S3 from '@aws-sdk/client-s3'
import type * as ECS from '@aws-sdk/client-ecs'
import type * as EKS from '@aws-sdk/client-eks'
import type * as SNS from '@aws-sdk/client-sns'
import type * as Route53 from '@aws-sdk/client-route-53'
import type * as ELBV2 from '@aws-sdk/client-elastic-load-balancing-v2'
import type {
	FileSystemDescription,
	FileSystemPolicyDescription,
	LifecycleConfigurationDescription,
	MountTargetDescription,
} from '@aws-sdk/client-efs'
import type {DistributionSummary, DistributionConfig, Tags} from '@aws-sdk/client-cloudfront'
import type {RateLimiter} from './scanners/common/RateLimiter'
import type {AwsCredentialIdentity} from '@aws-sdk/types'

export interface ExtendedCloudFrontDistribution extends DistributionSummary {
	DistributionConfig?: DistributionConfig
	Tags?: Tags
}

export interface ExtendedFileSystem extends FileSystemDescription {
	Policy?: FileSystemPolicyDescription
	LifecycleConfiguration?: LifecycleConfigurationDescription
	MountTargets?: MountTargetDescription[]
}

export interface ExtendedBucket extends S3.Bucket {
	CreationDate?: Date
	LocationConstraint?: string
	ARN: string
	Policy?: string
	Versioning?: string
	Encryption?: S3.ServerSideEncryptionConfiguration
	Tagging?: S3.Tag[]
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
	| EC2.Instance
	| EC2.InternetGateway
	| EC2.NatGateway
	| EC2.RouteTable
	| EC2.Vpc
	| EC2.VpcEndpoint
	| EC2.Subnet
	| EC2.Volume
	| EC2.TransitGateway
	| Trail
	| TableDescription
	| ECS.Cluster
	| ECS.Service
	| ECS.Task
	| SNS.Topic
	| ELBV2.LoadBalancer
	| ELBV2.TargetGroup
	| Route53.HostedZone

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
	'call-rate-rps': number
	'regional-only': boolean
}

export interface StandardOutputSchema {
	provider: 'aws'
	docVersion: '0.0.1'
	resources: Resources
	errors: ScannerError[]
	metadata: {
		startedAt: string
		finishedAt: string
	}
}

export type VisualResourceDescription = {
	region?: string
	type: string
	vpc?: string
	avialabilityZones?: string[]
	account?: string
}

export type VisualResources = {
	[arn: string]: VisualResourceDescription
}

export type VisualizationSchema = {
	resources: VisualResources
	metadata: {
		startedAt: string
		finishedAt: string
		account?: string
	}
}
