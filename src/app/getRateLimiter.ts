import {RateLimiter, createRateLimiter} from '@/scanners'
import {GetRateLimiterFunction} from '@/scanners/types'
import {Config} from '@/types'

/**
 * Some services have different names but should share the same rate limiter
 * For example, `ec2` and `ec2/volumes` should share the same rate limiter
 * This function returns the service name that should be used to get the rate limiter
 */
const getQuotaServiceName = (service: string) => {
	if (service.startsWith('ec2/')) {
		return 'ec2'
	}

	return service
}

/**
 * Returns the getRateLimiter function for a given service and region
 *
 * this also handles the shared rate limiters for services like `ec2` and `ec2/volumes` or `rds/clusters` and `rds/db-instances`
 */
export const getRateLimitService = (config: Config): GetRateLimiterFunction => {
	const rateLimiters = new Map<string, RateLimiter>()

	return (service: string, region?: string) => {
		const quotaServiceName = getQuotaServiceName(service)
		const key = region ? `${quotaServiceName}-${region}` : quotaServiceName

		if (!rateLimiters.has(key)) {
			rateLimiters.set(key, createRateLimiter(config['call-rate-rps']))
		}

		return rateLimiters.get(key) as RateLimiter
	}
}
