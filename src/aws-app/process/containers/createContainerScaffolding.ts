import type {ErrorManager, PlacementData, ProcessedContainers} from '../types'
import type {AwsResourcesList} from '@/types'
import type {Subnet} from '@aws-sdk/client-ec2'
import {
	createAccountContainer,
	createRegionContainer,
	createVpcContainer,
	createAvailabilityZoneContainer,
	createSecurityGroupContainer,
	createSubnetContainer,
} from './containerCreators'
import {generateContainerIdentifier} from '../utils/generateContainerIdentifier'

// Find the ARN of a subnet by its ID
const findSubnetArnById = (resources: AwsResourcesList, subnetId: string): string | undefined => {
	return Object.keys(resources).find((arn) => arn.includes(subnetId))
}

/**
 * Get the container scaffolding from the placement data.
 * In this step we only create empty containers and later we will assign resources to them.
 */
export const createContainerScaffolding = (
	placementData: PlacementData,
	resources: AwsResourcesList,
	errorManager: ErrorManager,
): ProcessedContainers => {
	const containers: ProcessedContainers = {
		accounts: {},
		regions: {},
		vpcs: {},
		availabilityZones: {},
		securityGroups: {},
		subnets: {},
	}

	for (const [_, data] of Object.entries(placementData)) {
		const {account, region, vpc, availabilityZones, securityGroups, subnets} = data

		// Create or update account container
		if (!containers.accounts[account]) {
			containers.accounts[account] = createAccountContainer(account)
		}

		// Create or update region container
		const regionIdentifier = generateContainerIdentifier(account, region)
		if (!containers.regions[regionIdentifier]) {
			containers.regions[regionIdentifier] = createRegionContainer(region)
			containers.accounts[account].children.regions.push(regionIdentifier)
		}

		// Create or update VPC container
		if (vpc !== null && !containers.vpcs[vpc]) {
			containers.vpcs[vpc] = createVpcContainer(vpc)
			containers.regions[regionIdentifier].children.vpcs.push(vpc)
		}

		// Create or update Availability Zone containers
		for (const az of availabilityZones) {
			const azIdentifier = generateContainerIdentifier(account, az)
			if (!containers.availabilityZones[azIdentifier]) {
				containers.availabilityZones[azIdentifier] = createAvailabilityZoneContainer(az)
				containers.regions[regionIdentifier].children.availabilityZones.push(azIdentifier)
			}
		}

		// Create or update Security Group containers
		for (const sg of securityGroups) {
			if (!containers.securityGroups[sg]) {
				containers.securityGroups[sg] = createSecurityGroupContainer(sg)
				if (vpc !== null) {
					containers.vpcs[vpc].children.securityGroups.push(sg)
				}
				for (const az of availabilityZones) {
					const azIdentifier = generateContainerIdentifier(account, az)
					try {
						if (!containers.availabilityZones[azIdentifier]) {
							containers.availabilityZones[azIdentifier] = createAvailabilityZoneContainer(az)
							containers.regions[regionIdentifier].children.availabilityZones.push(azIdentifier)
						}
						containers.availabilityZones[azIdentifier].children.securityGroups.push(sg)
					} catch (e) {
						errorManager.log(sg, `could not assign to AZ ${az}! AZ not found.`)
					}
				}
			}
		}

		// Create or update Subnet containers
		for (const subnet of subnets) {
			const subnetARN = findSubnetArnById(resources, subnet)
			if (subnetARN) {
				const subnetDescription = resources[subnetARN] as Subnet
				if (!containers.subnets[subnet]) {
					containers.subnets[subnet] = createSubnetContainer(subnet, subnetDescription)

					if (subnetDescription.VpcId) {
						try {
							if (!containers.vpcs[subnetDescription.VpcId]) {
								containers.vpcs[subnetDescription.VpcId] = createVpcContainer(subnetDescription.VpcId)
								containers.regions[regionIdentifier].children.vpcs.push(subnetDescription.VpcId)
							}
							containers.vpcs[subnetDescription.VpcId].children.subnets.push(subnet)
						} catch (e) {
							errorManager.log(subnet, `could not assign to VPC ${subnetDescription.VpcId}! VPC not found.`)
						}
					}

					if (subnetDescription.AvailabilityZone) {
						const azIdentifier = generateContainerIdentifier(account, subnetDescription.AvailabilityZone)
						try {
							if (!containers.availabilityZones[azIdentifier]) {
								containers.availabilityZones[azIdentifier] = createAvailabilityZoneContainer(
									subnetDescription.AvailabilityZone,
								)
								containers.regions[regionIdentifier].children.availabilityZones.push(azIdentifier)
							}
							containers.availabilityZones[azIdentifier].children.subnets.push(subnet)
						} catch (e) {
							errorManager.log(subnet, `could not assign to AZ ${subnetDescription.AvailabilityZone}! AZ not found.`)
						}
					}
				}
			}
		}
	}

	return containers
}
