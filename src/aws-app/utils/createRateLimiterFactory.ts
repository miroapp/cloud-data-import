import {createRateLimiter} from '@/scanners'
import {GetRateLimiterFunction} from '@/scanners/types'
import {RateLimiter} from '@/types'

/**
 * Returns the getRateLimiter function for a given service and region
 *
 * this also handles the shared rate limiters for services like `ec2` and `ec2/volumes` or `rds/clusters` and `rds/db-instances`
 */
export const createRateLimiterFactory = (callRateRps: number): GetRateLimiterFunction => {
	const rateLimiters = new Map<string, RateLimiter>()

	return (service: string, region?: string) => {
		const quotaServiceName = service.split('/')[0] // e.g. ec2/volumes and ec2/instance become 'ec2' or rds/proxy and rds/clusters become 'rds'
		const key = region ? `${quotaServiceName}-${region}` : quotaServiceName

		if (!rateLimiters.has(key)) {
			rateLimiters.set(key, createRateLimiter(callRateRps))
		}

		return rateLimiters.get(key) as RateLimiter
	}
}
