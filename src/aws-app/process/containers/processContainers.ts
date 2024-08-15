import {Resources} from '@/types'
import {ErrorManager, PlacementData, ProcessedContainers} from '../types'
import {assignResourcesToContainers} from './assignResourcesToContainers'
import {createContainerScaffolding} from './createContainerScaffolding'

export const getProcessedContainers = (
	placementData: PlacementData,
	resources: Resources,
	errorManager: ErrorManager,
): ProcessedContainers => {
	// Create the empty container scaffolding
	const scaffolding = createContainerScaffolding(placementData, resources, errorManager)

	// Fill the containers with the resources
	const containers = assignResourcesToContainers(placementData, scaffolding, errorManager)

	return containers
}
