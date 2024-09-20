import {RateLimiter} from '@/types'

export class RateLimiterMockImpl implements RateLimiter {
	private _isPaused: boolean = false
	private _queueSize: number = 0
	private _rate: number = 0

	constructor(rate: number = 0) {
		this._rate = rate
	}

	async throttle<T>(callback: () => Promise<T>): Promise<T> {
		if (this._isPaused) {
			throw new Error('RateLimiter is paused')
		}
		this._queueSize++
		try {
			return await callback()
		} finally {
			this._queueSize--
		}
	}

	pause(): void {
		this._isPaused = true
	}

	resume(): void {
		this._isPaused = false
	}

	abort(): void {
		this._queueSize = 0
	}

	get queueSize(): number {
		return this._queueSize
	}

	get isPaused(): boolean {
		return this._isPaused
	}

	get rate(): number {
		return this._rate
	}
}
