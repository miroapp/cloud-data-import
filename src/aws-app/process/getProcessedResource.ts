import {ResourceDescription, ProcessedResource} from '@/types'
import type * as EC2 from '@aws-sdk/client-ec2'
import type * as EFS from '@aws-sdk/client-efs'
import type * as Lambda from '@aws-sdk/client-lambda'
import type * as RDS from '@aws-sdk/client-rds'
import type * as ELBv2 from '@aws-sdk/client-elastic-load-balancing-v2'
import type * as Redshift from '@aws-sdk/client-redshift'

import {parse} from '@aws-sdk/util-arn-parser'

const getResourceType = (service: string, resource: string): string => {
	if (service === 'sns') return 'topic'
	if (service === 'sqs') return 'queue'
	return resource.split('/')[0].split(':')[0]
}

const getResourceName = (resourceFullName: string, resourceType: string): string => {
	if (resourceFullName.startsWith(resourceType)) {
		// remove the resource type and one more character (usually a colon or a slash)
		return resourceFullName.slice(resourceType.length + 1)
	}
	return resourceFullName
}

export const getProcessedResource = (arn: string, resource: ResourceDescription): ProcessedResource | null => {
	const arnData = parse(arn)

	if (!arnData) throw new Error('No ARN data found for the provided ARN.')

	const resourceType = getResourceType(arnData.service, arnData.resource)
	const name = getResourceName(arnData.resource, resourceType)

	const baseOutput: ProcessedResource = {
		name,
		region: arnData.region,
		type: `${arnData.service}:${resourceType}`,
	}

	switch (baseOutput.type) {
		case 'lambda:function': {
			const lambdaResource = resource as Lambda.FunctionConfiguration
			return {
				...baseOutput,
				vpc: lambdaResource.VpcConfig?.VpcId,
			}
		}
		case 'rds:db': {
			const rdsResource = resource as RDS.DBInstance
			return {
				...baseOutput,
				vpc: rdsResource.DBSubnetGroup?.VpcId,
				availabilityZones: rdsResource.AvailabilityZone ? [rdsResource.AvailabilityZone] : undefined,
			}
		}
		case 'rds:cluster': {
			const rdsCluster = resource as RDS.DBCluster
			return {
				...baseOutput,
				availabilityZones: rdsCluster.AvailabilityZones,
			}
		}
		case 'ec2:instance': {
			const ec2Instance = resource as EC2.Instance
			return {
				...baseOutput,
				vpc: ec2Instance.VpcId,
				availabilityZones: ec2Instance.Placement?.AvailabilityZone
					? [ec2Instance.Placement.AvailabilityZone]
					: undefined,
			}
		}
		case 'ec2:volume': {
			const ec2Volume = resource as EC2.Volume
			return {
				...baseOutput,
				availabilityZones: ec2Volume.AvailabilityZone ? [ec2Volume.AvailabilityZone] : undefined,
			}
		}
		case 'elasticloadbalancing:loadbalancer': {
			const elbResource = resource as ELBv2.LoadBalancer

			const isALB = elbResource.Type === 'application'

			const type = (() => {
				if (isALB) return `${baseOutput.type}:application`
				return baseOutput.type
			})()

			return {
				...baseOutput,
				type,
				vpc: elbResource.VpcId,
				availabilityZones: elbResource.AvailabilityZones?.map((az) => az.ZoneName).filter(Boolean) as string[],
			}
		}
		case 'elasticloadbalancing:targetgroup': {
			const targetGroup = resource as ELBv2.TargetGroup
			return {
				...baseOutput,
				vpc: targetGroup.VpcId,
				name: targetGroup.TargetGroupName ?? baseOutput.name,
			}
		}
		case 'elasticfilesystem:file-system': {
			const efsResource = resource as EFS.FileSystemDescription
			return {
				...baseOutput,
				availabilityZones: efsResource.AvailabilityZoneName ? [efsResource.AvailabilityZoneName] : undefined,
			}
		}
		case 'redshift:cluster': {
			const redshiftCluster = resource as Redshift.Cluster
			return {
				...baseOutput,
				vpc: redshiftCluster.VpcId,
				availabilityZones: redshiftCluster.AvailabilityZone ? [redshiftCluster.AvailabilityZone] : undefined,
			}
		}
		case 'ec2:network-acl': {
			const ec2Acl = resource as EC2.NetworkAcl
			return {
				...baseOutput,
				vpc: ec2Acl.VpcId,
			}
		}
		default:
			return baseOutput
	}
}
