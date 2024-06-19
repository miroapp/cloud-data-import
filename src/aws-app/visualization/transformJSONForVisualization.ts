import {StandardOutputSchema, VisualizationDataSchema} from '@/types'
import {getResourcePlacementInfo} from './getResourcePlacementInfo'

export const transformJSONForVisualization = async (data: StandardOutputSchema): Promise<VisualizationDataSchema> => {
	const output: VisualizationDataSchema = {...data, resources: {}}

	for (const arn in data.resources) {
		try {
			const placementInfo = getResourcePlacementInfo(arn, data.resources[arn])
			if (placementInfo) {
				output.resources[arn] = placementInfo
			}
		} catch (error) {
			console.log(error)
		}
	}
	return output
}
