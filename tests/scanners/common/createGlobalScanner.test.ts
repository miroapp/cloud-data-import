import {createGlobalScanner} from '@/scanners'
import {Resources, ResourceDescription, Credentials, ScannerLifecycleHook} from '@/types'

import {RateLimiterMockImpl} from 'tests/mocks/RateLimiterMock'
import {createMockedHook} from 'tests/mocks/hookMock'

describe('createGlobalScanner', () => {
	let mockRateLimiter: RateLimiterMockImpl
	let mockGetRateLimiter: jest.Mock
	let mockHooks: ScannerLifecycleHook[]
	let mockCredentials: Credentials
	let mockScanFunction: jest.Mock

	beforeEach(() => {
		mockRateLimiter = new RateLimiterMockImpl()
		mockGetRateLimiter = jest.fn().mockReturnValue(mockRateLimiter)
		mockHooks = [createMockedHook(), createMockedHook()]
		mockCredentials = undefined
		mockScanFunction = jest.fn().mockResolvedValue({} as Resources<never>)

		jest.clearAllMocks()
	})

	it('should return a function', () => {
		const scanner = createGlobalScanner('mockService', mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		expect(scanner).toBeInstanceOf(Function)
	})

	it('should get rate limiter with the correct service name', () => {
		const scanner = createGlobalScanner('mockService', mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		scanner()

		expect(mockGetRateLimiter).toHaveBeenCalledWith('mockService')
	})

	it('should return resources and no errors when scan is successful', async () => {
		const mockResources: Resources<ResourceDescription> = {
			resource1: {id: 'resource1', name: 'Resource 1'},
		}
		mockScanFunction.mockResolvedValue(mockResources)

		const scanner = createGlobalScanner('mockService', mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		const result = await scanner()

		expect(mockScanFunction).toHaveBeenCalledWith(mockCredentials, mockRateLimiter)
		expect(result).toEqual({resources: mockResources, errors: []})
	})

	it('should return errors if scan fails', async () => {
		const mockError = new Error('Mock error')
		mockScanFunction.mockRejectedValue(mockError)

		const scanner = createGlobalScanner('mockService', mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		const result = await scanner()

		expect(mockGetRateLimiter).toHaveBeenCalledWith('mockService')
		expect(mockScanFunction).toHaveBeenCalledWith(mockCredentials, mockRateLimiter)
		expect(result).toEqual({
			resources: {} as Resources<never>,
			errors: [{service: 'mockService', message: mockError.message}],
		})
	})

	it('should call hooks appropriately during the scan', async () => {
		const mockResources: Resources<ResourceDescription> = {
			resource1: {id: 'resource1', name: 'Resource 1'},
			resource2: {id: 'resource2', name: 'Resource 2'},
		}
		mockScanFunction.mockResolvedValue(mockResources)

		const scanner = createGlobalScanner('mockService', mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		await scanner()

		mockHooks.forEach((hook) => {
			expect(hook.onStart).toHaveBeenCalledTimes(1)
			expect(hook.onComplete).toHaveBeenCalledTimes(1)
			expect(hook.onError).not.toHaveBeenCalled()

			expect(hook.onStart).toHaveBeenCalledWith('mockService')
			expect(hook.onComplete).toHaveBeenCalledWith(mockResources, 'mockService')
		})
	})

	it('should call onError hook if scan fails', async () => {
		const mockError = new Error('Mock error')
		mockScanFunction.mockRejectedValue(mockError)

		const scanner = createGlobalScanner('mockService', mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		await scanner()

		mockHooks.forEach((hook) => {
			expect(hook.onStart).toHaveBeenCalledTimes(1)
			expect(hook.onComplete).not.toHaveBeenCalled()
			expect(hook.onError).toHaveBeenCalledTimes(1)

			expect(hook.onStart).toHaveBeenCalledWith('mockService')
			expect(hook.onError).toHaveBeenCalledWith(mockError, 'mockService')
		})
	})
})
