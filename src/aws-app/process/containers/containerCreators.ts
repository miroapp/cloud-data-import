import {
	AccountContainer,
	AvailabilityZoneContainer,
	RegionContainer,
	SecurityGroupContainer,
	SubnetContainer,
	VpcContainer,
} from '@/types'
import type {Subnet} from '@aws-sdk/client-ec2'
import {isSubnetPrivate} from '../utils/isSubnetPrivate'

export const createAccountContainer = (account: string): AccountContainer => ({
	name: `Account-${account}`,
	children: {
		resources: [],
		regions: [],
	},
})

export const createRegionContainer = (region: string): RegionContainer => ({
	name: region,
	children: {
		resources: [],
		vpcs: [],
		availabilityZones: [],
	},
})

export const createVpcContainer = (vpc: string): VpcContainer => ({
	name: vpc,
	children: {
		resources: [],
		subnets: [],
		securityGroups: [],
	},
})

export const createAvailabilityZoneContainer = (az: string): AvailabilityZoneContainer => ({
	name: az,
	children: {
		resources: [],
		subnets: [],
		securityGroups: [],
	},
})

export const createSecurityGroupContainer = (sg: string): SecurityGroupContainer => ({
	name: sg,
	children: {
		resources: [],
	},
})

export const createSubnetContainer = (subnet: string, subnetDescription: Subnet): SubnetContainer => ({
	name: subnet,
	children: {
		resources: [],
	},
	type: isSubnetPrivate(subnetDescription) ? 'private' : 'public',
})
