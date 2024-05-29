import {Credentials, Scanner, ScannerLifecycleHook} from '../types'
import {createRegionalScanner} from './common/createRegionalScanner'
import {createGlobalScanner} from './common/createGlobalScanner'
import {RateLimiter} from './common/RateLimiter'

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

export const getAwsScanners = (
	credentials: Credentials,
	regions: string[],
	shouldIncludeGlobalServices: boolean,
	hooks: ScannerLifecycleHook[],
): Scanner[] => {
	const options = {
		// Pass the credentials to the scanners so that they can make API calls.
		credentials,
		// For now, we are using a single dummy rate limiter for all scanners. It is 10 requests per second.
		getRateLimiter: () => new RateLimiter(10),
		// Pass the hooks to the scanners so that they can call the appropriate lifecycle hooks at the right time.
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
