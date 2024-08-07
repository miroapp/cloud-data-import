import {ProcessedData} from '@/types'

export type ResourcePlacementData = {
	name: string
	region: string
	service: string
	type: string
	variant: string
	vpc: string | null
	availabilityZones: string[]
	subnets: string[]
	securityGroups: string[]
}

export type PlacementData = {
	[arn: string]: ResourcePlacementData
}

export type ProcessedResources = ProcessedData['resources']
export type ProcessedConnections = ProcessedData['connections']
export type ProcessedContainers = ProcessedData['containers']
