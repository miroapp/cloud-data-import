// transform awsData to visualization schema for each service.

import {ResourceDescription, VisualResourceDescription} from '@/types'
import type * as EC2 from '@aws-sdk/client-ec2'
import type * as EFS from '@aws-sdk/client-efs'
import type * as Lambda from '@aws-sdk/client-lambda'
import type * as RDS from '@aws-sdk/client-rds'
import {parse} from '@aws-sdk/util-arn-parser'

export const transformByConfig = (arn: string, resource: ResourceDescription): VisualResourceDescription | null => {
	const arnData = parse(arn)

	if (!arnData) throw new Error('No arn Data found')

	const resourceType = arnData.resource.split('/')[0].split(':')[0]

	const output: VisualResourceDescription = {
		region: arnData.region,
		type: `${arnData.service}:${resourceType}`,
	}

	switch (arnData.service) {
		case 'lambda:function':
			output.vpc = (resource as Lambda.FunctionConfiguration).VpcConfig?.VpcId
			break
		case 'rds:db':
			output.vpc = (resource as RDS.DBInstance).DBSubnetGroup?.VpcId
			output.avialabilityZones = (resource as RDS.DBInstance).AvailabilityZone
				? [String((resource as RDS.DBInstance).AvailabilityZone)]
				: undefined
			break
		case 'rds:cluster':
			output.avialabilityZones = (resource as RDS.DBCluster).AvailabilityZones
			break
		case 'ec2:instance':
			output.vpc = (resource as EC2.Instance).VpcId
			break
		case 'elasticloadbalancing:loadbalancer':
		case 'elasticloadbalancing:targetgroup':
			if ((resource as EFS.FileSystemDescription).AvailabilityZoneName) {
				output.avialabilityZones = [(resource as EFS.FileSystemDescription).AvailabilityZoneName as string]
			}
		default:
			break
	}

	return output
}
