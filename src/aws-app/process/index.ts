import type {ProcessedData, Resources} from '@/types'

import {getPlacementData} from './getPlacementData'
import {getProcessedResources} from './resources'
import {getProcessedContainers} from './containers'

export const getProcessedData = (resources: Resources): ProcessedData => {
	// Get the placement data which is a simplified version of the resources focusing on the location of the resources
	const placementData = getPlacementData(resources)

	// Calculate the containers, connections and resources
	const processedResources = getProcessedResources(placementData)
	const containers = getProcessedContainers(placementData, resources)

	// Return the processed data
	return {
		resources: processedResources,
		connections: [],
		containers,
	}
}
