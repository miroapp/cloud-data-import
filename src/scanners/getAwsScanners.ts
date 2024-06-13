import {Credentials, Scanner, ScannerLifecycleHook} from '@/types'
import {GetRateLimiterFunction} from './types'
import {createRegionalScanner, createGlobalScanner} from '.'

import {getAutoScalingResources} from './scan-functions/aws/autoscaling'
import {getCloudFrontResources} from './scan-functions/aws/cloudfront'
import {getCloudTrailResources} from './scan-functions/aws/cloudtrail'
import {getDynamoDBResources} from './scan-functions/aws/dynamodb'
import {getECSResources} from './scan-functions/aws/ecs'
import {getEFSResources} from './scan-functions/aws/efs'
import {getEKSResources} from './scan-functions/aws/eks'
import {getELBV2Resources} from './scan-functions/aws/elbv2'
import {getLambdaResources} from './scan-functions/aws/lambda'
import {getRDSResources} from './scan-functions/aws/rds'
import {getS3Resources} from './scan-functions/aws/s3'
import {getSNSTopics} from './scan-functions/aws/sns'
import {getEC2Instances} from './scan-functions/aws/ec2-instances'
import {getEC2Vpcs} from './scan-functions/aws/ec2-vpcs'
import {getEC2VpcEndpoints} from './scan-functions/aws/ec2-vpc-endpoints'
import {getEC2Subnets} from './scan-functions/aws/ec2-subnets'
import {getEC2RouteTables} from './scan-functions/aws/ec2-route-tables'
import {getEC2InternetGateways} from './scan-functions/aws/ec2-internet-gateways'
import {getEC2NatGateways} from './scan-functions/aws/ec2-nat-gateways'
import {getEC2TransitGateways} from './scan-functions/aws/ec2-transit-gateways'
import {getEC2Volumes} from './scan-functions/aws/ec2-volumes'

interface GetAwsScannersArguments {
	credentials: Credentials
	getRateLimiter: GetRateLimiterFunction
	hooks: ScannerLifecycleHook[]
	regions: string[]
	shouldIncludeGlobalServices: boolean
}

export const getAwsScanners = ({
	credentials,
	hooks,
	getRateLimiter,
	regions,
	shouldIncludeGlobalServices,
}: GetAwsScannersArguments): Scanner[] => {
	const options = {
		credentials,
		getRateLimiter,
		hooks,
	}

	// Regional scanners
	const scanners: Scanner[] = [
		createRegionalScanner('autoscaling', getAutoScalingResources, regions, options),
		createRegionalScanner('dynamodb', getDynamoDBResources, regions, options),
		createRegionalScanner('ec2/instances', getEC2Instances, regions, options),
		createRegionalScanner('ec2/vpcs', getEC2Vpcs, regions, options),
		createRegionalScanner('ec2/vpc-endpoints', getEC2VpcEndpoints, regions, options),
		createRegionalScanner('ec2/subnets', getEC2Subnets, regions, options),
		createRegionalScanner('ec2/route-tables', getEC2RouteTables, regions, options),
		createRegionalScanner('ec2/internet-gateways', getEC2InternetGateways, regions, options),
		createRegionalScanner('ec2/nat-gateways', getEC2NatGateways, regions, options),
		createRegionalScanner('ec2/transit-gateways', getEC2TransitGateways, regions, options),
		createRegionalScanner('ec2/volumes', getEC2Volumes, regions, options),
		createRegionalScanner('ecs', getECSResources, regions, options),
		createRegionalScanner('efs', getEFSResources, regions, options),
		createRegionalScanner('elbv2', getELBV2Resources, regions, options),
		createRegionalScanner('eks', getEKSResources, regions, options),
		createRegionalScanner('lambda', getLambdaResources, regions, options),
		createRegionalScanner('rds', getRDSResources, regions, options),
		createRegionalScanner('sns', getSNSTopics, regions, options),
	]

	// Global scanners
	if (shouldIncludeGlobalServices) {
		scanners.push(
			createGlobalScanner('cloudfront', getCloudFrontResources, options),
			createGlobalScanner('cloudtrail', getCloudTrailResources, options),
			createGlobalScanner('s3', getS3Resources, options),
		)
	}

	return scanners
}
