import {PlacementData, ProcessedResources} from '../types'

export const getProcessedResources = (placementData: PlacementData): ProcessedResources => {
	const processedResources = {} as ProcessedResources

	for (const [arn, {name, service, type, variant}] of Object.entries(placementData)) {
		const unifiedType = [service, type, variant].filter(Boolean).join(':')

		processedResources[arn] = {
			name,
			type: unifiedType,
		}
	}

	return processedResources
}
