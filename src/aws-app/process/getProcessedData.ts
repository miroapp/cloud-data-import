import {ProcessedData, Resources} from '@/types'
import {getPlacementData} from './getPlacementData'
import {ResourcePlacementData} from './types'

export const getProcessedData = async (resources: Resources): Promise<ProcessedData> => {
	const placementData = getPlacementData(resources)

	const unique = Object.values(placementData).reduce(
		(acc, data) => {
			const key = `${data.service}-${data.type}-${data.variant}`
			acc[key] = data
			return acc
		},
		{} as {[key: string]: ResourcePlacementData},
	)

	return {
		resources: unique,
		connections: [],
		containers: {
			accounts: {},
			regions: {},
			vpcs: {},
			availabilityZones: {},
			securityGroups: {},
			subnets: {},
		},
	}
}
