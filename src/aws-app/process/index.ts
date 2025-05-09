import type {AwsProcessedData, AwsResourcesList, AwsTags} from '@/types'

import {getPlacementData} from './getPlacementData'
import {getProcessedResources} from './resources'
import {getProcessedContainers} from './containers'
import {ProcessingErrorManager} from './utils/ProcessingErrorManager'
import {extractUniqueTagKeysAndValues} from './utils/extractUniqueTagKeysAndValues'

export const getAwsProcessedData = (resources: AwsResourcesList, resourceTags: AwsTags): AwsProcessedData => {
	const processingErrorsManager = new ProcessingErrorManager()

	// Get the placement data which is a simplified version of the resources focusing on the location of the resources
	const placementData = getPlacementData(resources)

	// Calculate the containers, connections and resources
	const processedResources = getProcessedResources(placementData, resourceTags)
	const containers = getProcessedContainers(placementData, resources, processingErrorsManager)

	// Log all collected errors
	processingErrorsManager.render()

	// Tag values
	const uniqueTagKeysAndValues = extractUniqueTagKeysAndValues(resourceTags)

	// Return the processed data
	return {
		resources: processedResources,
		connections: [],
		containers,
		tags: uniqueTagKeysAndValues,
	}
}
