import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

/**
 * 0️⃣ Define your new resource type in src/definitions/supported-services.ts
 */
export async function getSampleInstances(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.DYNAMODB_TABLES>> {
	/**
	 * 1️⃣ Create an client via the given credentials and region
	 *
	 * const client = new SampleClient({ region, credentials });
	 */

	/**
	 * 2️⃣ Define the command or any magic you need to get the resources
	 *
	 * const command = new DescribeInstancesCommand();
	 */

	/**
	 * 3️⃣ Remember to attach the rate limiter whenever making a request to AWS (⭐⭐⭐ important)
	 *
	 * const response = await rateLimiter.throttle(() => client.send(command));
	 *
	 * or
	 *
	 * const response = await rateLimiter.throttle(() => {
	 *   // whatever type of request you need to make
	 * });
	 */

	// 4️⃣ Parse the response and format it as `{ [ARN]: Resource }`
	return {
		// [instance.ARN]: instance,
	}
}

// ⛳ Finally, import and use this function in `src/scanners/getAwsScanners.ts`
