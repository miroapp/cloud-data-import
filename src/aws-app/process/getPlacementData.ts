import type {EnrichedBucket, ResourceDescription, Resources} from '@/types'
import type * as AutoScaling from '@aws-sdk/client-auto-scaling'
import type * as EC2 from '@aws-sdk/client-ec2'
import type * as EFS from '@aws-sdk/client-efs'
import type * as Lambda from '@aws-sdk/client-lambda'
import type * as RDS from '@aws-sdk/client-rds'
import type * as ELBv1 from '@aws-sdk/client-elastic-load-balancing'
import type * as ELBv2 from '@aws-sdk/client-elastic-load-balancing-v2'
import type * as Redshift from '@aws-sdk/client-redshift'
import type * as Athena from '@aws-sdk/client-athena'
import type * as ECS from '@aws-sdk/client-ecs'

import {PlacementData, ResourcePlacementData} from './types'
import {ARNInfo, getArnInfo} from './utils/getArnInfo'

export const getResourcePlacementData = (arnInfo: ARNInfo, resource: ResourceDescription): ResourcePlacementData => {
	const {name, region, service, type, account} = arnInfo

	const baseOutput: ResourcePlacementData = {
		account,
		name,
		region,
		service,
		type,
		variant: '',
		vpc: null,
		availabilityZones: [],
		subnets: [],
		securityGroups: [],
		tags: {},
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

	if (service === 'autoscaling' && type === 'autoScalingGroup') {
		const asgResource = resource as AutoScaling.AutoScalingGroup
		return {
			...baseOutput,
			name: asgResource.AutoScalingGroupName ?? baseOutput.name,
			availabilityZones: asgResource.AvailabilityZones ?? [],
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
			subnets: rdsResource.DBSubnetGroup?.Subnets?.map((subnet) => subnet.SubnetIdentifier).filter(Boolean) as string[],
			securityGroups: rdsResource.VpcSecurityGroups?.map((sg) => sg.VpcSecurityGroupId).filter(Boolean) as string[],
		}
	}

	// RDS DB Clusters
	if (service === 'rds' && type === 'cluster') {
		const rdsCluster = resource as RDS.DBCluster
		return {
			...baseOutput,
			availabilityZones: rdsCluster.AvailabilityZones || [],
			securityGroups: rdsCluster.VpcSecurityGroups?.map((sg) => sg.VpcSecurityGroupId).filter(Boolean) as string[],
		}
	}

	// RDS DB Proxies
	if (service === 'rds' && type === 'proxy') {
		const rdsProxy = resource as RDS.DBProxy
		return {
			...baseOutput,
			vpc: rdsProxy.VpcId ?? null,
			subnets: rdsProxy.VpcSubnetIds ?? [],
			securityGroups: rdsProxy.VpcSecurityGroupIds ?? [],
		}
	}

	// EC2 Instances
	if (service === 'ec2' && type === 'instance') {
		const ec2Instance = resource as EC2.Instance
		return {
			...baseOutput,
			vpc: ec2Instance.VpcId ?? null,
			availabilityZones: ec2Instance.Placement?.AvailabilityZone ? [ec2Instance.Placement.AvailabilityZone] : [],
			subnets: ec2Instance.SubnetId ? [ec2Instance.SubnetId] : [],
		}
	}

	// EC2 VPCs
	if (service === 'ec2' && type === 'vpc') {
		const ec2Vpc = resource as EC2.Vpc
		return {
			...baseOutput,
			vpc: ec2Vpc.VpcId ?? null,
		}
	}

	// EC2 VPC Endpoints
	if (service === 'ec2' && type === 'vpc-endpoint') {
		const vpcEndpoint = resource as EC2.VpcEndpoint
		return {
			...baseOutput,
			vpc: vpcEndpoint.VpcId ?? null,
			subnets: vpcEndpoint.SubnetIds ?? [],
		}
	}

	// EC2 Subnets
	if (service === 'ec2' && type === 'subnet') {
		const ec2Subnet = resource as EC2.Subnet
		return {
			...baseOutput,
			vpc: ec2Subnet.VpcId ?? null,
			availabilityZones: ec2Subnet.AvailabilityZone ? [ec2Subnet.AvailabilityZone] : [],
		}
	}

	// EC2 Network Interfaces
	if (service === 'ec2' && type === 'network-interface') {
		const ec2NetworkInterface = resource as EC2.NetworkInterface
		return {
			...baseOutput,
			vpc: ec2NetworkInterface.VpcId ?? null,
			availabilityZones: ec2NetworkInterface.AvailabilityZone ? [ec2NetworkInterface.AvailabilityZone] : [],
			subnets: ec2NetworkInterface.SubnetId ? [ec2NetworkInterface.SubnetId] : [],
		}
	}

	// EC2 Route Tables
	if (service === 'ec2' && type === 'route-table') {
		const routeTable = resource as EC2.RouteTable
		return {
			...baseOutput,
			vpc: routeTable.VpcId ?? null,
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

	// EC2 Internet Gateways
	if (service === 'ec2' && type === 'internet-gateway') {
		const internetGateway = resource as EC2.InternetGateway
		return {
			...baseOutput,
			vpc: internetGateway.Attachments?.[0]?.VpcId ?? null,
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

	// EC2 Nat Gateways
	if (service === 'ec2' && type === 'nat-gateway') {
		const natGateway = resource as EC2.NatGateway
		return {
			...baseOutput,
			vpc: natGateway.VpcId ?? null,
			subnets: natGateway.SubnetId ? [natGateway.SubnetId] : [],
		}
	}

	// ECS Tasks
	if (service === 'ecs' && type === 'task') {
		const ecsTask = resource as ECS.Task
		return {
			...baseOutput,
			availabilityZones: ecsTask.availabilityZone ? [ecsTask.availabilityZone] : [],
		}
	}

	// Load Balancers
	if (service === 'elasticloadbalancing' && type === 'loadbalancer') {
		const isV2 = !!(resource as any).LoadBalancerArn // LoadBalancerArn is only present in ELBv2

		// ELBv2 Load Balancers
		if (isV2) {
			const elbResource = resource as ELBv2.LoadBalancer

			const variant = elbResource.Type === 'application' ? 'application' : ''

			return {
				...baseOutput,
				variant,
				name: elbResource.LoadBalancerName ?? baseOutput.name,
				vpc: elbResource.VpcId ?? null,
				availabilityZones: elbResource.AvailabilityZones?.map((az) => az.ZoneName).filter(Boolean) as string[],
				subnets: elbResource.AvailabilityZones?.map((az) => az.SubnetId).filter(Boolean) as string[],
				securityGroups: elbResource.SecurityGroups ?? [],
			}
		}

		// ELBv1 Load Balancers
		const elbResource = resource as ELBv1.LoadBalancerDescription
		return {
			...baseOutput,
			name: elbResource.LoadBalancerName ?? baseOutput.name,
			vpc: elbResource.VPCId ?? null,
			availabilityZones: elbResource.AvailabilityZones ?? [],
			subnets: elbResource.Subnets ?? [],
			securityGroups: elbResource.SecurityGroups ?? [],
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

	// Lambda Functions
	if (service === 'lambda' && type === 'function') {
		const lambdaResource = resource as Lambda.FunctionConfiguration
		return {
			...baseOutput,
			vpc: lambdaResource.VpcConfig?.VpcId ?? null,
			subnets: lambdaResource.VpcConfig?.SubnetIds ?? [],
			securityGroups: lambdaResource.VpcConfig?.SecurityGroupIds ?? [],
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
			subnets: ec2Acl.Associations?.map((assoc) => assoc.SubnetId).filter(Boolean) as string[],
		}
	}

	// S3 Buckets
	if (service === 's3') {
		const s3Bucket = resource as EnrichedBucket
		return {
			...baseOutput,
			type: 'bucket',
			name: s3Bucket.Name || baseOutput.name,
			account: s3Bucket.Account,
			region: s3Bucket.Location,
		}
	}

	return baseOutput
}

export const isContainerAndShouldBeIgnored = (service: string, type: string): boolean => {
	const isVPC = service === 'ec2' && type === 'vpc'
	const isSubnet = service === 'ec2' && type === 'subnet'
	const isSecurityGroup = service === 'ec2' && type === 'security-group'
	const isAvailabilityZone = service === 'ec2' && type === 'availability-zone'

	return isVPC || isSubnet || isSecurityGroup || isAvailabilityZone
}

export const getPlacementData = (resources: Resources): PlacementData => {
	const placementData: PlacementData = {}

	for (const [arn, resource] of Object.entries(resources)) {
		const arnInfo = getArnInfo(arn)

		// Skip VPC, Subnet, Security Group, and Availability Zone resources
		if (isContainerAndShouldBeIgnored(arnInfo.service, arnInfo.type)) {
			continue
		}

		placementData[arn] = getResourcePlacementData(arnInfo, resource)
	}

	return placementData
}
