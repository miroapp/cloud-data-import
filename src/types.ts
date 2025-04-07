import type {AwsCredentialIdentity} from '@aws-sdk/types'
import {awsRegionIds} from './definitions/supported-regions'
import {
	type AwsSupportedResources,
	type AllSupportedAwsServices,
	AwsResourceDescriptionMap,
} from './definitions/supported-services'

export type AwsRegionId = (typeof awsRegionIds)[number]

export type AwsResourcesList<T extends AwsSupportedResources = AwsSupportedResources> = {
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

export type AwsRegionalScanFunction<T extends AwsSupportedResources> = (
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
) => Promise<AwsResourcesList<T>>

export type AwsGlobalScanFunction<T extends AwsSupportedResources> = (
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
) => Promise<AwsResourcesList<T>>

export type AwsScannerFunction<T extends AwsSupportedResources> = AwsRegionalScanFunction<T> | AwsGlobalScanFunction<T>

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
export interface AwsScannerLifecycleHook<T extends AllSupportedAwsServices> {
	onStart?: (service: T, region?: string) => void
	onComplete?: (
		resources: T extends AwsSupportedResources ? AwsResourcesList<AwsSupportedResources> : {},
		service: T,
		region?: string,
	) => void
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

export type ConnectionType = 'ELB_TO_ASG' | 'HZ_TO_ELB' | 'HZ_TO_S3'
export type Connection = {
	from: string // resource arn
	to: string // resource arn
	type: ConnectionType
}

export interface AwsProcessedData {
	resources: {
		[arn: string]: {
			name: string
			type: string
			tags: {[key: string]: string | undefined}
		}
	}
	connections: Connection[]
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
