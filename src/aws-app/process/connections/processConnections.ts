import {AwsResourcesList} from '@/types'
import {ErrorManager, PlacementData, ProcessedConnections} from '../types'
import {getElbToAutoScalingConnections} from './getElbToAutoScalingConnections'
import {groupArnsBasedOnType} from './groupArnsBasedOnType'
import {getCloudFrontToS3Connections} from './getCloudFrontToS3Connections'
import {getRoute53ToElbConnections} from './getRoute53ToElbConnections'
import {getRoute53ToCloudFrontConnections} from './getRoute53ToCloudFrontConnections'
import {getRoute53ToS3Connections} from './getRoute53ToS3Connections'

export const getProcessedConnections = (
	placementData: PlacementData,
	resources: AwsResourcesList,
	errorManager: ErrorManager,
): ProcessedConnections => {
	const groupedArns = groupArnsBasedOnType(placementData)

	const elbToAsgConnections = getElbToAutoScalingConnections(groupedArns, resources)
	const cloudFrontToS3Connections = getCloudFrontToS3Connections(groupedArns, resources)
	const route53ToElbConnections = getRoute53ToElbConnections(groupedArns, resources)
	const route53ToCloudFrontConnections = getRoute53ToCloudFrontConnections(groupedArns, resources)
	const route53ToS3Connections = getRoute53ToS3Connections(groupedArns, resources)

	return [
		...elbToAsgConnections,
		...cloudFrontToS3Connections,
		...route53ToElbConnections,
		...route53ToCloudFrontConnections,
		...route53ToS3Connections,
	]
}
