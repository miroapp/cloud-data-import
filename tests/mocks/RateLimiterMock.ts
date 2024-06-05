import {RateLimiter} from '@/scanners'

export class RateLimiterMockImpl implements RateLimiter {
	async throttle<T>(callback: () => Promise<T>): Promise<T> {
		return callback()
	}
}
