export interface RetryOptions {
	maxRetries: number
	initialDelay: number
	maxDelay: number
	backoffFactor: number
}

export abstract class RetryStrategy {
	constructor(protected options: RetryOptions) {}

	abstract shouldRetry(error: any): boolean

	async retry<T>(fn: () => Promise<T>, retryCount: number = 0): Promise<T> {
		try {
			return await fn()
		} catch (error) {
			if (retryCount < this.options.maxRetries && this.shouldRetry(error)) {
				const delay = Math.min(
					this.options.initialDelay * Math.pow(this.options.backoffFactor, retryCount),
					this.options.maxDelay,
				)
				await new Promise((resolve) => setTimeout(resolve, delay))
				return this.retry(fn, retryCount + 1)
			}
			throw error
		}
	}
}
