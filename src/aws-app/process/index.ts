import type {ProcessedData, Resources} from '@/types'

import {getPlacementData} from './getPlacementData'
import {getProcessedResources} from './resources'
import {getProcessedContainers} from './containers'
import {ProcessingErrorManager} from './utils/ProcessingErrorManager'

export const getProcessedData = (resources: Resources): ProcessedData => {
	const processingErrorsManager = new ProcessingErrorManager()

	// Get the placement data which is a simplified version of the resources focusing on the location of the resources
	const placementData = getPlacementData(resources)

	// Calculate the containers, connections and resources
	const processedResources = getProcessedResources(placementData)
	const containers = getProcessedContainers(placementData, resources, processingErrorsManager)

	// Log all collected errors
	processingErrorsManager.render()

	// Return the processed data
	return {
		resources: processedResources,
		connections: [],
		containers,
	}
}
