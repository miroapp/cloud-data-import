import {ScannerLifecycleHook} from '@/types'

export const createMockedHook = (): ScannerLifecycleHook => ({
	onStart: jest.fn(),
	onComplete: jest.fn(),
	onError: jest.fn(),
})
