export const createMockedHook = () => ({
	onStart: jest.fn(),
	onComplete: jest.fn(),
	onError: jest.fn(),
})
