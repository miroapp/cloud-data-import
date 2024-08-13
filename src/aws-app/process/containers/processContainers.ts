import {Resources} from '@/types'
import {PlacementData, ProcessedContainers} from '../types'
import {assignResourcesToContainers} from './assignResourcesToContainers'
import {createContainerScaffolding} from './createContainerScaffolding'

export const getProcessedContainers = (placementData: PlacementData, resources: Resources): ProcessedContainers => {
	// Create the empty container scaffolding
	const scaffolding = createContainerScaffolding(placementData, resources)

	// Fill the containers with the resources
	const containers = assignResourcesToContainers(placementData, scaffolding)

	return containers
}
