import {ProcessedData, Resources} from '@/types'
import {getPlacementData} from './getPlacementData'
import {getProcessedContainers} from './getProcessedContainers'
import {assignResourcesToContainers} from './assignResourcesToContainers'

export const getProcessedData = (resources: Resources): ProcessedData => {
	const placementData = getPlacementData(resources)
	const emptyContainers = getProcessedContainers(placementData, resources)
	const containers = assignResourcesToContainers(placementData, emptyContainers)

	return {
		resources: {},
		connections: [],
		containers,
	}
}
