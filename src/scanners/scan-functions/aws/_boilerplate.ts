import {DBInstance} from '@aws-sdk/client-rds'
import {Credentials, Resources, RateLimiter} from '@/types'

/**
 * 0️⃣ I put DBInstance just as an example of a real aws type.
 *
 * You may need to add this type to the `ResourceDescription` type located in src/types.ts
 */
type SampleInstance = DBInstance

export async function getSampleInstances(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<SampleInstance>> {
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
