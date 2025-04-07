import {AwsResourcesList} from '@/types'
import {ErrorManager, PlacementData, ProcessedConnections} from '../types'
import {getElbToAutoScalingConnections} from './getElbToAutoScalingConnections'
import {groupArnsBasedOnType} from './groupArnsBasedOnType'

export const getProcessedConnections = (
	placementData: PlacementData,
	resources: AwsResourcesList,
	errorManager: ErrorManager,
): ProcessedConnections => {
	const groupedArns = groupArnsBasedOnType(placementData)

	const elbToAsgConnections = getElbToAutoScalingConnections(groupedArns, resources)

	return [...elbToAsgConnections]
}
