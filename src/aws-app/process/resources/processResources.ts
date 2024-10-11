import {PlacementData, ProcessedResources} from '../types'
import {ResourceTags} from '@/types'

export const getProcessedResources = (placementData: PlacementData, tags: ResourceTags): ProcessedResources => {
	const processedResources = {} as ProcessedResources

	for (const [arn, {name, service, type, variant}] of Object.entries(placementData)) {
		const unifiedType = [service, type, variant].filter(Boolean).join(':')

		processedResources[arn] = {
			name,
			type: unifiedType,
			tags: tags[arn] ?? {},
		}
	}

	return processedResources
}
