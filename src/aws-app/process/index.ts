import type {AwsProcessedData, AwsResourcesList, AwsTags} from '@/types'

import {getPlacementData} from './getPlacementData'
import {getProcessedResources} from './resources'
import {getProcessedContainers} from './containers'
import {ProcessingErrorManager} from './utils/ProcessingErrorManager'
import {getProcessedConnections} from './connections/processConnections'

export const getAwsProcessedData = (resources: AwsResourcesList, resourceTags: AwsTags): AwsProcessedData => {
	const processingErrorsManager = new ProcessingErrorManager()

	// Get the placement data which is a simplified version of the resources focusing on the location of the resources
	const placementData = getPlacementData(resources)

	// Calculate the containers, connections and resources
	const processedResources = getProcessedResources(placementData, resourceTags)
	const processedContainers = getProcessedContainers(placementData, resources, processingErrorsManager)
	const processedConnections = getProcessedConnections(placementData, resources, processingErrorsManager)

	// Log all collected errors
	processingErrorsManager.render()

	// Tag values
	let possibleTagValues: {[key: string]: string[]} = {}
	for (const [_arn, tags] of Object.entries(resourceTags)) {
		for (const [key, value] of Object.entries(tags)) {
			if (!possibleTagValues[key]) {
				possibleTagValues[key] = []
			}

			if (value && !possibleTagValues[key].includes(value)) {
				possibleTagValues[key].push(value)
			}
		}
	}

	// Return the processed data
	return {
		resources: processedResources,
		connections: processedConnections,
		containers: processedContainers,
		tags: possibleTagValues,
	}
}
