import {Resources} from '@/types'
import {PlacementData, ProcessedContainers} from './types'
import type * as EC2 from '@aws-sdk/client-ec2'
import {isSubnetPrivate} from './common/isSubnetPrivate'

export const getProcessedContainers = (placementData: PlacementData, resources: Resources): ProcessedContainers => {
	const uniqueAccounts: ProcessedContainers['accounts'] = {}
	const uniqueRegions: ProcessedContainers['regions'] = {}
	const uniqueVpcs: ProcessedContainers['vpcs'] = {}
	const uniqueAvailabilityZones: ProcessedContainers['availabilityZones'] = {}
	const uniqueSecurityGroups: ProcessedContainers['securityGroups'] = {}
	const uniqueSubnets: ProcessedContainers['subnets'] = {}

	for (const [_, data] of Object.entries(placementData)) {
		const {account, region, vpc, availabilityZones, securityGroups, subnets} = data

		// Account Container Creation
		if (account && !uniqueAccounts[account]) {
			uniqueAccounts[account] = {
				name: account,
				children: {
					resources: [],
					regions: [],
				},
			}
		}

		// as region name is not unique among different accounts, we need to use region id
		const regionIdentifier = `${account}/${region}`

		// Region Container Creation
		if (region && !uniqueRegions[regionIdentifier]) {
			uniqueRegions[regionIdentifier] = {
				name: region,
				children: {
					resources: [],
					vpcs: [],
					availabilityZones: [],
				},
			}

			const connectedAccount = uniqueAccounts[account]

			if (connectedAccount && !connectedAccount.children.regions.includes(regionIdentifier)) {
				connectedAccount.children.regions.push(regionIdentifier)
			}
		}

		// Vpc Container Creation
		if (vpc && !uniqueVpcs[vpc]) {
			uniqueVpcs[vpc] = {
				name: vpc,
				children: {
					resources: [],
					subnets: [],
					securityGroups: [],
				},
			}

			const connectedRegion = uniqueRegions[regionIdentifier]

			if (connectedRegion && !connectedRegion.children.vpcs.includes(vpc)) {
				connectedRegion.children.vpcs.push(vpc)
			}
		}

		// AvailabilityZone Container Creation
		for (const az of availabilityZones) {
			const azIdentifier = `${account}/${az}`

			if (az && !uniqueAvailabilityZones[azIdentifier]) {
				uniqueAvailabilityZones[azIdentifier] = {
					name: az,
					children: {
						resources: [],
						subnets: [],
						securityGroups: [],
					},
				}

				const connectedRegion = uniqueRegions[regionIdentifier]

				if (connectedRegion && !connectedRegion.children.availabilityZones.includes(azIdentifier)) {
					connectedRegion.children.availabilityZones.push(azIdentifier)
				}
			}
		}

		// SecurityGroup Container Creation
		for (const sg of securityGroups) {
			if (sg && !uniqueSecurityGroups[sg]) {
				uniqueSecurityGroups[sg] = {
					name: sg,
					children: {
						resources: [],
					},
				}

				// @todo we need to scan security group description to find vpc and availability zone from there instead of using vpc and az from placement data
				if (vpc) {
					const connectedVpc = uniqueVpcs[vpc]

					if (connectedVpc && !connectedVpc.children.securityGroups.includes(sg)) {
						connectedVpc.children.securityGroups.push(sg)
					}
				}

				for (const az of availabilityZones) {
					if (az) {
						const azIdentifier = `${account}/${az}`

						const connectedAz = uniqueAvailabilityZones[azIdentifier]

						if (connectedAz && !connectedAz.children.securityGroups.includes(sg)) {
							connectedAz.children.securityGroups.push(sg)
						}
					}
				}
			}
		}

		// Subnet Container Creation
		for (const subnet of subnets) {
			if (subnet && !uniqueSubnets[subnet]) {
				const subnetARN = Object.keys(resources).find((arn) => arn.includes(subnet))

				if (!subnetARN) {
					continue
				}

				const subnetDescription = resources[subnetARN] as EC2.Subnet
				const type = isSubnetPrivate(subnetDescription) ? 'private' : 'public'

				uniqueSubnets[subnet] = {
					name: subnet,
					children: {
						resources: [],
					},
					type,
				}

				if (subnetDescription.VpcId) {
					const connectedVpc = uniqueVpcs[subnetDescription.VpcId]

					if (!connectedVpc) {
						throw new Error(`VPC ${subnetDescription.VpcId} not found for subnet ${subnet}`)
					}

					if (!connectedVpc.children.subnets.includes(subnet)) {
						connectedVpc.children.subnets.push(subnet)
					}
				}

				if (subnetDescription.AvailabilityZone) {
					const azIdentifier = `${account}/${subnetDescription.AvailabilityZone}`

					const connectedAz = uniqueAvailabilityZones[azIdentifier]

					if (!connectedAz) {
						throw new Error(`Availability Zone ${azIdentifier} not found for subnet ${subnet}`)
					}

					if (!connectedAz.children.subnets.includes(subnet)) {
						connectedAz.children.subnets.push(subnet)
					}
				}
			}
		}
	}

	return {
		accounts: uniqueAccounts,
		regions: uniqueRegions,
		vpcs: uniqueVpcs,
		availabilityZones: uniqueAvailabilityZones,
		securityGroups: uniqueSecurityGroups,
		subnets: uniqueSubnets,
	}
}
