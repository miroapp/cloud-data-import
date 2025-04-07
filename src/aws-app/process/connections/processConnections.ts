import {AwsResourcesList} from '@/types'
import {ErrorManager, PlacementData, ProcessedConnections} from '../types'
import {getAlbToAutoScalingConnections} from './getAlbToAutoScalingConnections'
import {groupArnsBasedOnType} from './groupArnsBasedOnType'

export const getProcessedConnections = (
	placementData: PlacementData,
	resources: AwsResourcesList,
	errorManager: ErrorManager,
): ProcessedConnections => {
	const groupedArns = groupArnsBasedOnType(placementData)

	const albToAsgConnections = getAlbToAutoScalingConnections(groupedArns, resources)

	return [...albToAsgConnections]
}
