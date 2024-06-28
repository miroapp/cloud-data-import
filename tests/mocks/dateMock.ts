const INITIAL_TIME = 1000000000000

export const mockDate = (increment = 10000) => {
	let lastTimeUsed = INITIAL_TIME

	class MockDate extends Date {
		constructor() {
			super(lastTimeUsed)
			lastTimeUsed += increment
		}

		toISOString() {
			return `MockedDate-ISO-${this.getTime()}`
		}
	}

	global.Date = MockDate as unknown as DateConstructor

	return {
		getExpectedTime(calls = 0) {
			return INITIAL_TIME + increment * calls
		},
		getExpectedTimeISOString(calls = 0) {
			return `MockedDate-ISO-${this.getExpectedTime(calls)}`
		},
		reset() {
			lastTimeUsed = INITIAL_TIME
		},
		restore() {
			global.Date = Date
		},
	}
}
