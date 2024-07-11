import {ResourceDescription, ProcessedResource} from '@/types'
import type * as EC2 from '@aws-sdk/client-ec2'
import type * as EFS from '@aws-sdk/client-efs'
import type * as Lambda from '@aws-sdk/client-lambda'
import type * as RDS from '@aws-sdk/client-rds'
import type * as ELBv2 from '@aws-sdk/client-elastic-load-balancing-v2'

import {parse} from '@aws-sdk/util-arn-parser'

export const getProcessedResource = (arn: string, resource: ResourceDescription): ProcessedResource | null => {
	const arnData = parse(arn)

	if (!arnData) throw new Error('No arn Data found')

	const resourceType = (() => {
		if (arnData.service === 'sns') return 'topic'
		if (arnData.service === 'sqs') return 'queue'

		return arnData.resource.split('/')[0].split(':')[0]
	})()

	const name = (() => {
		const resourceFullName = arnData.resource // could be either something like "function:name" or "function/name" or in some cases just "name"

		if (resourceFullName.startsWith(resourceType)) {
			// remove the resource type + one more character (usually a colon or a slash)
			return resourceFullName.slice(resourceType.length + 1)
		}

		return resourceFullName
	})()

	const output: ProcessedResource = {
		name,
		region: arnData.region,
		type: `${arnData.service}:${resourceType}`,
	}

	switch (output.type) {
		case 'lambda:function':
			output.vpc = (resource as Lambda.FunctionConfiguration).VpcConfig?.VpcId
			break
		case 'rds:db':
			output.vpc = (resource as RDS.DBInstance).DBSubnetGroup?.VpcId
			output.availabilityZones = (resource as RDS.DBInstance).AvailabilityZone
				? [String((resource as RDS.DBInstance).AvailabilityZone)]
				: undefined
			break
		case 'rds:cluster':
			output.availabilityZones = (resource as RDS.DBCluster).AvailabilityZones
			break
		case 'ec2:instance':
			output.vpc = (resource as EC2.Instance).VpcId
			output.availabilityZones = [(resource as EC2.Instance).Placement?.AvailabilityZone as string]
			break
		case 'ec2:volume':
			output.availabilityZones = [(resource as EC2.Volume).AvailabilityZone as string]
			break
		case 'elasticloadbalancing:loadbalancer':
			output.vpc = (resource as ELBv2.LoadBalancer).VpcId
			output.availabilityZones = (resource as ELBv2.LoadBalancer).AvailabilityZones?.map(
				(az) => az.ZoneName || '',
			).filter(Boolean)
			break
		case 'elasticloadbalancing:targetgroup':
			output.vpc = (resource as ELBv2.TargetGroup).VpcId
			const targetGroupName = (resource as ELBv2.TargetGroup).TargetGroupName
			if (targetGroupName) output.name = targetGroupName
			break
		case 'elasticfilesystem:file-system':
			if ((resource as EFS.FileSystemDescription).AvailabilityZoneName) {
				output.availabilityZones = [(resource as EFS.FileSystemDescription).AvailabilityZoneName as string]
			}
		default:
			break
	}

	return output
}
