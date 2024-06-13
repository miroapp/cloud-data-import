// transform awsData to visualization schema for each service.

import {ExtendedFileSystem, ResourceDescription, VisualResourceDescription} from '@/types'
import type * as EC2 from '@aws-sdk/client-ec2'
import type * as Lambda from '@aws-sdk/client-lambda'
import type * as RDS from '@aws-sdk/client-rds'
import {parse} from '@aws-sdk/util-arn-parser'

export const transformByConfig = (arn: string, resource: ResourceDescription): VisualResourceDescription | null => {
	const arnData = parse(arn)

	if (!arnData) throw new Error('No arn Data found')

	const output: VisualResourceDescription = {
		region: arnData.region,
		type: `${arnData.service}:${arnData.resource}`,
	}

	switch (arnData.service) {
		case 'lambda':
			output.vpc = (resource as Lambda.FunctionConfiguration).VpcConfig?.VpcId
			break
		case 'rds':
			if ((resource as RDS.DBInstance).DBInstanceArn) {
				output.vpc = (resource as RDS.DBInstance).DBSubnetGroup?.VpcId
				output.avialabilityZones = (resource as RDS.DBInstance).AvailabilityZone
					? [String((resource as RDS.DBInstance).AvailabilityZone)]
					: undefined
			} else {
				output.avialabilityZones = (resource as RDS.DBCluster).AvailabilityZones
			}
			break
		case 'ec2':
			if (arnData.resource.startsWith('instance/')) {
				output.vpc = (resource as EC2.Instance).VpcId
			}
			break
		case 'efs':
			if ((resource as ExtendedFileSystem).AvailabilityZoneName) {
				output.avialabilityZones = [(resource as ExtendedFileSystem).AvailabilityZoneName as string]
			}
		default:
			break
	}

	return output
}
