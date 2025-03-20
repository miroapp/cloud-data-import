import {type AllSupportedAwsServices} from '@/definitions/supported-services'
import {AwsScannerLifecycleHook} from '@/types'

export const createMockedHook = (): AwsScannerLifecycleHook<AllSupportedAwsServices> => ({
	onStart: jest.fn(),
	onComplete: jest.fn(),
	onError: jest.fn(),
})
