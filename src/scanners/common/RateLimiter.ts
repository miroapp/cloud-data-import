import {RateLimiter} from '@/types'
import {RetryStrategy} from './RetryStrategy'

export class RateLimiterImpl implements RateLimiter {
	private executionTimesMs: number[] = []
	private pendingQueue: (() => void)[] = []
	private timeoutId: NodeJS.Timeout | null = null
	private _isPaused = false
	private readonly intervalMs: number
	private retryStrategy: RetryStrategy | null

	constructor(
		private _rate: number,
		retryStrategy: RetryStrategy | null = null,
	) {
		if (!Number.isFinite(_rate) || _rate <= 0) {
			throw new TypeError('Expected `rate` to be a positive finite number')
		}
		this.intervalMs = 1000 / _rate
		this.retryStrategy = retryStrategy
	}

	private scheduleNextExecution(): void {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId)
		}

		if (this._isPaused || this.pendingQueue.length === 0) {
			return
		}

		const now = Date.now()
		let delay = 0

		if (this.executionTimesMs.length > 0) {
			const nextExecutionTime = this.executionTimesMs[this.executionTimesMs.length - 1] + this.intervalMs
			delay = Math.max(0, nextExecutionTime - now)
		}

		this.timeoutId = setTimeout(() => {
			const fn = this.pendingQueue.shift()
			if (fn) {
				this.executionTimesMs.push(Date.now())
				if (this.executionTimesMs.length > 10) {
					this.executionTimesMs.shift()
				}
				fn()
			}
			this.scheduleNextExecution()
		}, delay)
	}

	throttle<U>(fn: () => Promise<U>): Promise<U> {
		return new Promise<U>((resolve, reject) => {
			const wrappedFn = () => {
				if (this.retryStrategy) {
					this.retryStrategy.retry(fn).then(resolve).catch(reject)
				} else {
					fn().then(resolve).catch(reject)
				}
			}

			this.pendingQueue.push(wrappedFn)
			this.scheduleNextExecution()
		})
	}

	pause(): void {
		this._isPaused = true
		if (this.timeoutId) {
			clearTimeout(this.timeoutId)
			this.timeoutId = null
		}
	}

	resume(): void {
		this._isPaused = false
		this.scheduleNextExecution()
	}

	abort(): void {
		this.pendingQueue = []
		this.executionTimesMs = []
		if (this.timeoutId) {
			clearTimeout(this.timeoutId)
			this.timeoutId = null
		}
	}

	get queueSize(): number {
		return this.pendingQueue.length
	}

	get isPaused(): boolean {
		return this._isPaused
	}

	get rate(): number {
		return this._rate
	}
}

export const createRateLimiter = (rate: number) => new RateLimiterImpl(rate)
