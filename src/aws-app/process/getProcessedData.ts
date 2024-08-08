import {ProcessedData, Resources} from '@/types'
import {getPlacementData} from './getPlacementData'
import {getProcessedContainers} from './getProcessedContainers'
import {assignResourcesToContainers} from './assignResourcesToContainers'
import {getResourcesPlacementData} from './getResourcesPlacementData'
import {getProcessedResources} from './getProcessedResources'

export const getProcessedData = (resources: Resources): ProcessedData => {
	const placementData = getPlacementData(resources)
	const emptyContainers = getProcessedContainers(placementData, resources)

	const onlyResourcesPlacementData = getResourcesPlacementData(placementData)
	const containers = assignResourcesToContainers(onlyResourcesPlacementData, emptyContainers)
	const processedResources = getProcessedResources(onlyResourcesPlacementData)

	return {
		resources: processedResources,
		connections: [],
		containers,
	}
}
