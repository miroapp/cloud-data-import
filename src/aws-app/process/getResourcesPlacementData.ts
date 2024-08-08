import {PlacementData} from './types'

export const getResourcesPlacementData = (placementData: PlacementData): PlacementData => {
	const resourcesPlacementData = {} as PlacementData

	for (const [arn, {service, type}] of Object.entries(placementData)) {
		const isVPC = service === 'ec2' && type === 'vpc'
		const isSubnet = service === 'ec2' && type === 'subnet'
		const isSecurityGroup = service === 'ec2' && type === 'security-group'
		const isAvailabilityZone = service === 'ec2' && type === 'availability-zone'

		if (isVPC || isSubnet || isSecurityGroup || isAvailabilityZone) {
			continue
		}

		resourcesPlacementData[arn] = placementData[arn]
	}

	return resourcesPlacementData
}
