import {ProcessedData} from '@/types'

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

export type ProcessedResources = ProcessedData['resources']
export type ProcessedConnections = ProcessedData['connections']
export type ProcessedContainers = ProcessedData['containers']
