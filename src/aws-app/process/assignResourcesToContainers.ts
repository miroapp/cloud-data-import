import {PlacementData, ProcessedContainers} from './types'

export const assignResourcesToContainers = (
	placementData: PlacementData,
	processedContainers: ProcessedContainers,
): ProcessedContainers => {
	const containers = JSON.parse(JSON.stringify(processedContainers)) as ProcessedContainers

	for (const [arn, placement] of Object.entries(placementData)) {
		// Subnet and Security Group placement
		if (placement.subnets.length || placement.securityGroups.length) {
			// Assign the resource to the appropriate subnets
			for (const subnetId of placement.subnets) {
				if (containers.subnets[subnetId]) {
					containers.subnets[subnetId].children.resources.push(arn)
				} else {
					throw new Error(`Subnet ${subnetId} not found in processed containers`)
				}
			}

			// Assign the resource to the appropriate security groups
			for (const securityGroupId of placement.securityGroups) {
				if (containers.securityGroups[securityGroupId]) {
					containers.securityGroups[securityGroupId].children.resources.push(arn)
				} else {
					throw new Error(`Security Group ${securityGroupId} not found in processed containers`)
				}
			}

			// If the resource can be place in a subnet or security group, we can skip the rest of the loop
			continue
		}

		// VPC and Availability Zone placement
		if (placement.vpc || placement.availabilityZones.length) {
			// Assign the resource to the appropriate VPC
			if (placement.vpc) {
				if (containers.vpcs[placement.vpc]) {
					containers.vpcs[placement.vpc].children.resources.push(arn)
				} else {
					throw new Error(`VPC ${placement.vpc} not found in processed containers`)
				}
			}

			// Assign the resource to the appropriate Availability Zones
			for (const az of placement.availabilityZones) {
				const azIdentifier = `${placement.account}/${az}`

				if (containers.availabilityZones[azIdentifier]) {
					containers.availabilityZones[azIdentifier].children.resources.push(arn)
				} else {
					throw new Error(`Availability Zone ${azIdentifier} not found in processed containers`)
				}
			}

			// If the resource can be place in a VPC or Availability Zone, we can skip the rest of the loop
			continue
		}

		// Region placement
		if (placement.region) {
			const regionIdentifier = `${placement.account}/${placement.region}`

			if (containers.regions[regionIdentifier]) {
				containers.regions[regionIdentifier].children.resources.push(arn)
			} else {
				throw new Error(`Region ${regionIdentifier} not found in processed containers`)
			}

			// If the resource can be place in a region, we can skip the rest of the loop
			continue
		}

		// Account placement
		if (placement.account) {
			if (containers.accounts[placement.account]) {
				containers.accounts[placement.account].children.resources.push(arn)
			} else {
				throw new Error(`Account ${placement.account} not found in processed containers`)
			}

			// If the resource can be place in an account, we can skip the rest of the loop
			continue
		}

		// If the resource cannot be placed in any container, we can throw an error
		throw new Error(`Resource ${arn} cannot be placed in any container`)
	}

	return containers
}
