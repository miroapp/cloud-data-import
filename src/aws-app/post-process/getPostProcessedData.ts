import {PostProcessedData, Resources} from '@/types'
import {getResourcePlacementInfo} from './getResourcePlacementInfo'

export const getPostProcessedData = async (resources: Resources): Promise<PostProcessedData> => {
	const processed: PostProcessedData = {
		resources: {},
	}

	for (const arn in resources) {
		try {
			const placementInfo = getResourcePlacementInfo(arn, resources[arn])
			if (placementInfo) {
				processed.resources[arn] = placementInfo
			}
		} catch (error) {
			console.log(error)
		}
	}
	return processed
}
