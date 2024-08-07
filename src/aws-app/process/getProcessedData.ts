import {ProcessedData, Resources} from '@/types'
import {getResourcePlacementData} from './getResourcePlacementData'

export const getProcessedData = async (resources: Resources): Promise<ProcessedData> => {
	const processedResources: ProcessedData['resources'] = {}

	// Fill out the processed resources
	for (const arn in resources) {
		try {
			const processedResource = getResourcePlacementData(arn, resources[arn])
			if (processedResource) {
				processedResources[arn] = {
					name: processedResource.name,
					type: processedResource.type,
				}
			}
		} catch (error) {
			console.log(error)
		}
	}

	return {
		resources: processedResources,
		connections: [],
		containers: {
			accounts: {},
			regions: {},
			vpcs: {},
			availabilityZones: {},
			securityGroups: {},
			subnets: {},
		},
	}
}
