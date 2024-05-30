import {Credentials, Scanner, ScannerLifecycleHook} from '@/types'
import {createRegionalScanner} from './common/createRegionalScanner'
import {createGlobalScanner} from './common/createGlobalScanner'

import {getAutoScalingResources} from './scan-functions/aws/autoscaling'
import {getCloudFrontResources} from './scan-functions/aws/cloudfront'
import {getCloudTrailResources} from './scan-functions/aws/cloudtrail'
import {getDynamoDBResources} from './scan-functions/aws/dynamodb'
import {getEC2Resources} from './scan-functions/aws/ec2'
import {getECSResources} from './scan-functions/aws/ecs'
import {getEFSResources} from './scan-functions/aws/efs'
import {getEKSResources} from './scan-functions/aws/eks'
import {getLambdaResources} from './scan-functions/aws/lambda'
import {getRDSResources} from './scan-functions/aws/rds'
import {getS3Resources} from './scan-functions/aws/s3'
import {GetRateLimiterFunction} from './types'

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
		createRegionalScanner('ec2', getEC2Resources, regions, options),
		createRegionalScanner('ecs', getECSResources, regions, options),
		createRegionalScanner('efs', getEFSResources, regions, options),
		createRegionalScanner('eks', getEKSResources, regions, options),
		createRegionalScanner('lambda', getLambdaResources, regions, options),
		createRegionalScanner('rds', getRDSResources, regions, options),
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
