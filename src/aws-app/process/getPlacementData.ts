import type {ResourceDescription, Resources} from '@/types'
import type * as EC2 from '@aws-sdk/client-ec2'
import type * as EFS from '@aws-sdk/client-efs'
import type * as Lambda from '@aws-sdk/client-lambda'
import type * as RDS from '@aws-sdk/client-rds'
import type * as ELBv2 from '@aws-sdk/client-elastic-load-balancing-v2'
import type * as Redshift from '@aws-sdk/client-redshift'
import type * as Athena from '@aws-sdk/client-athena'

import {PlacementData, ResourcePlacementData} from './types'
import {getArnInfo} from './common/getArnInfo'

export const getResourcePlacementData = (arn: string, resource: ResourceDescription): ResourcePlacementData => {
	const {name, region, service, type} = getArnInfo(arn)

	const baseOutput: ResourcePlacementData = {
		name,
		region,
		service,
		type,
		variant: '',
		vpc: null,
		availabilityZones: [],
		subnets: [],
		securityGroups: [],
	}

	// Athena Named Queries
	if (service === 'athena') {
		// Detecting athena named queries
		const isNamedQuery = baseOutput.name.includes('/query/')
		if (isNamedQuery) {
			const namedQuery = resource as Athena.NamedQuery
			return {
				...baseOutput,
				name: namedQuery.Name ?? baseOutput.name,
				type: `named-query`,
			}
		}
	}

	// Lambda functions
	if (service === 'lambda' && type === 'function') {
		const lambdaResource = resource as Lambda.FunctionConfiguration
		return {
			...baseOutput,
			vpc: lambdaResource.VpcConfig?.VpcId ?? null,
		}
	}

	// RDS DB Instances
	if (service === 'rds' && type === 'db') {
		const rdsResource = resource as RDS.DBInstance
		return {
			...baseOutput,
			vpc: rdsResource.DBSubnetGroup?.VpcId ?? null,
			availabilityZones: rdsResource.AvailabilityZone ? [rdsResource.AvailabilityZone] : [],
		}
	}

	// RDS DB Clusters
	if (service === 'rds' && type === 'cluster') {
		const rdsCluster = resource as RDS.DBCluster
		return {
			...baseOutput,
			availabilityZones: rdsCluster.AvailabilityZones || [],
		}
	}

	// EC2 Instances
	if (service === 'ec2' && type === 'instance') {
		const ec2Instance = resource as EC2.Instance
		return {
			...baseOutput,
			vpc: ec2Instance.VpcId ?? null,
			availabilityZones: ec2Instance.Placement?.AvailabilityZone ? [ec2Instance.Placement.AvailabilityZone] : [],
		}
	}

	// EC2 Network Interfaces
	if (service === 'ec2' && type === 'network-interface') {
		const ec2NetworkInterface = resource as EC2.NetworkInterface
		return {
			...baseOutput,
			vpc: ec2NetworkInterface.VpcId ?? null,
			availabilityZones: ec2NetworkInterface.AvailabilityZone ? [ec2NetworkInterface.AvailabilityZone] : [],
		}
	}

	// EC2 Volumes
	if (service === 'ec2' && type === 'volume') {
		const ec2Volume = resource as EC2.Volume
		return {
			...baseOutput,
			availabilityZones: ec2Volume.AvailabilityZone ? [ec2Volume.AvailabilityZone] : [],
		}
	}

	// EC2 VPN Gateways
	if (service === 'ec2' && type === 'vpn-gateway') {
		const vpnGateway = resource as EC2.VpnGateway
		return {
			...baseOutput,
			availabilityZones: vpnGateway.AvailabilityZone ? [vpnGateway.AvailabilityZone] : [],
			vpc: vpnGateway.VpcAttachments?.[0]?.VpcId ?? null,
		}
	}

	// ELBv2 Load Balancers
	if (service === 'elasticloadbalancing' && type === 'loadbalancer') {
		const elbResource = resource as ELBv2.LoadBalancer

		const variant = elbResource.Type === 'application' ? 'application' : ''

		return {
			...baseOutput,
			variant,
			vpc: elbResource.VpcId ?? null,
			availabilityZones: elbResource.AvailabilityZones?.map((az) => az.ZoneName).filter(Boolean) as string[],
		}
	}

	// ELBv2 Target Groups
	if (service === 'elasticloadbalancing' && type === 'targetgroup') {
		const targetGroup = resource as ELBv2.TargetGroup
		return {
			...baseOutput,
			vpc: targetGroup.VpcId ?? null,
			name: targetGroup.TargetGroupName ?? baseOutput.name,
		}
	}

	// EFS File Systems
	if (service === 'elasticfilesystem' && type === 'file-system') {
		const efsResource = resource as EFS.FileSystemDescription
		return {
			...baseOutput,
			availabilityZones: efsResource.AvailabilityZoneName ? [efsResource.AvailabilityZoneName] : [],
		}
	}

	// Redshift Clusters
	if (service === 'redshift' && type === 'cluster') {
		const redshiftCluster = resource as Redshift.Cluster
		return {
			...baseOutput,
			vpc: redshiftCluster.VpcId ?? null,
			availabilityZones: redshiftCluster.AvailabilityZone ? [redshiftCluster.AvailabilityZone] : [],
		}
	}

	// EC2 Network ACLs
	if (service === 'ec2' && type === 'network-acl') {
		const ec2Acl = resource as EC2.NetworkAcl
		return {
			...baseOutput,
			vpc: ec2Acl.VpcId ?? null,
		}
	}

	return baseOutput
}

export const getPlacementData = (resources: Resources): PlacementData => {
	const placementData: PlacementData = {}

	for (const [arn, resource] of Object.entries(resources)) {
		const data = getResourcePlacementData(arn, resource)

		placementData[arn] = data
	}

	return placementData
}
