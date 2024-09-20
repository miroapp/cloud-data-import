import {RetryOptions, RetryStrategy} from '@/scanners/common/RetryStrategy'

export class AWSRateLimitExhaustionRetryStrategy extends RetryStrategy {
	constructor(options: Partial<RetryOptions> = {}) {
		super({
			maxRetries: 5,
			initialDelay: 1000,
			maxDelay: 20000,
			backoffFactor: 2,
			...options,
		})
	}

	shouldRetry(error: any): boolean {
		// AWS-specific error codes for rate limit exhaustion
		const rateLimitErrorCodes = [
			'ThrottlingException',
			'TooManyRequestsException',
			'RequestLimitExceeded',
			'Throttling',
			'RequestThrottled',
			'RequestThrottledException',
			'SlowDown',
		]

		return rateLimitErrorCodes.includes(error.code) || error.statusCode === 429
	}
}
