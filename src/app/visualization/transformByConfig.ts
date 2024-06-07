// transform awsData to visualization schema for each service.

import { ExtendedFileSystem, ExtendedInstance, ResourceDescription, VisualResourceDescription } from "@/types";
import { FunctionConfiguration } from "@aws-sdk/client-lambda";
import { DBCluster, DBInstance } from "@aws-sdk/client-rds";
import {parse, ARN} from '@aws-sdk/util-arn-parser'


export const transformByConfig = (arn: string, resource: ResourceDescription): VisualResourceDescription | null => {
    const arnData: ARN = parse(arn)

    if (!arnData) return null;

    const output: VisualResourceDescription = {
        region: arnData.region,
        type: arnData.service,
    }

    switch (arnData.service) {
        case 'lambda':
            output.vpc = (resource as FunctionConfiguration).VpcConfig?.VpcId
            break;
        case 'rds':
            if ((resource as DBInstance).DBInstanceArn) {
                output.vpc = (resource as DBInstance).DBSubnetGroup?.VpcId
                output.avialabilityZones = (resource as DBInstance).AvailabilityZone ? [String((resource as DBInstance).AvailabilityZone)] : undefined
            } else {
                output.avialabilityZones = (resource as DBCluster).AvailabilityZones
            }
            break;
        case 'ec2':
            output.vpc = (resource as ExtendedInstance).VpcId
            break;
        case 'efs':
            if ((resource as ExtendedFileSystem).AvailabilityZoneName) {
                output.avialabilityZones = [(resource as ExtendedFileSystem).AvailabilityZoneName as string]
            }
        default:
            break;
    }

    return output
}

