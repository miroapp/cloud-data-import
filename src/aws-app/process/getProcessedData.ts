import {ProcessedData, Resources} from '@/types'
import {getProcessedResource} from './getProcessedResource'

export const getProcessedData = async (resources: Resources): Promise<ProcessedData> => {
	const processed: ProcessedData = {
		resources: {},
	}

	// Fill out the processed resources
	for (const arn in resources) {
		try {
			const processedResource = getProcessedResource(arn, resources[arn])
			if (processedResource) {
				processed.resources[arn] = processedResource
			}
		} catch (error) {
			console.log(error)
		}
	}

	return processed
}
