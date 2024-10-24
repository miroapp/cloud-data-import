import {AwsProcessedData} from '@/types'

export type ResourcePlacementData = {
	account: string
	name: string
	region: string
	service: string
	type: string
	variant: string
	vpc: string | null
	availabilityZones: string[]
	subnets: string[]
	securityGroups: string[]
	tags: {[key: string]: number}
}

export type PlacementData = {
	[arn: string]: ResourcePlacementData
}

export interface ErrorManager {
	log: (topic: string, message: string) => void
	render: () => void
}

export type ProcessedResources = AwsProcessedData['resources']
export type ProcessedConnections = AwsProcessedData['connections']
export type ProcessedContainers = AwsProcessedData['containers']
