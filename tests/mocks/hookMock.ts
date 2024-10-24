import {AwsScannerLifecycleHook} from '@/types'

export const createMockedHook = (): AwsScannerLifecycleHook => ({
	onStart: jest.fn(),
	onComplete: jest.fn(),
	onError: jest.fn(),
})
