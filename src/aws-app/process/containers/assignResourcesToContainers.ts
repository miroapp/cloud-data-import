import {PlacementData, ProcessedContainers} from '../types'

export const assignResourcesToContainers = (
	placementData: PlacementData,
	emptyContainers: ProcessedContainers,
): ProcessedContainers => {
	const containers = JSON.parse(JSON.stringify(emptyContainers)) as ProcessedContainers
	const errors: Record<string, string[]> = {}

	const addError = (arn: string, message: string) => {
		if (!errors[arn]) errors[arn] = []
		errors[arn].push(message)
	}

	for (const [arn, placement] of Object.entries(placementData)) {
		// Subnet and Security Group placement
		if (placement.subnets.length || placement.securityGroups.length) {
			// Assign the resource to the appropriate subnets
			for (const subnetId of placement.subnets) {
				if (containers.subnets[subnetId]) {
					containers.subnets[subnetId].children.resources.push(arn)
				} else {
					addError(arn, `Could not assign to ${subnetId}. Subnet not found`)
				}
			}

			// Assign the resource to the appropriate security groups
			for (const securityGroupId of placement.securityGroups) {
				if (containers.securityGroups[securityGroupId]) {
					containers.securityGroups[securityGroupId].children.resources.push(arn)
				} else {
					addError(arn, `Could not assign to ${securityGroupId}. Security Group not found`)
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
					addError(arn, `Could not assign to ${placement.vpc}. VPC not found`)
				}
			}

			// Assign the resource to the appropriate Availability Zones
			for (const az of placement.availabilityZones) {
				const azIdentifier = `${placement.account}/${az}`

				if (containers.availabilityZones[azIdentifier]) {
					containers.availabilityZones[azIdentifier].children.resources.push(arn)
				} else {
					addError(arn, `Could not assign to ${azIdentifier}. Availability Zone not found`)
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
				addError(arn, `Could not assign to ${regionIdentifier}. Region not found`)
			}

			// If the resource can be place in a region, we can skip the rest of the loop
			continue
		}

		// Account placement
		if (placement.account) {
			if (containers.accounts[placement.account]) {
				containers.accounts[placement.account].children.resources.push(arn)
			} else {
				addError(arn, `Could not assign to ${placement.account}. Account not found`)
			}

			// If the resource can be place in an account, we can skip the rest of the loop
			continue
		}

		// If the resource cannot be placed in any container, we can throw an error
		addError(arn, 'Cannot be placed in any container')
	}

	// Log errors
	if (Object.keys(errors).length > 0) {
		console.error('\n\nNon-critical errors occurred while processing scanned resources:')
		for (const [arn, messages] of Object.entries(errors)) {
			console.error(`Resource "${arn}":`)
			messages.forEach((message) => console.error(`  - ${message}`))
		}
	}

	return containers
}