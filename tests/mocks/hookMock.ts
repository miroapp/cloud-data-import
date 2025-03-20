import {AwsSupportedManagementServices, AwsSupportedResources} from '@/definitions/supported-services'
import {AwsScannerLifecycleHook} from '@/types'

export const createMockedHook = (): AwsScannerLifecycleHook<
	AwsSupportedResources | AwsSupportedManagementServices
> => ({
	onStart: jest.fn(),
	onComplete: jest.fn(),
	onError: jest.fn(),
})
