import {createRegionalScanner} from '@/scanners'
import {Resources, ResourceDescription, Credentials, ScannerLifecycleHook} from '@/types'

import {RateLimiterMockImpl} from 'tests/mocks/RateLimiterMock'
import {createMockedHook} from 'tests/mocks/hookMock'

describe('createRegionalScanner', () => {
	let mockRateLimiter: RateLimiterMockImpl
	let mockGetRateLimiter: jest.Mock
	let mockTagsRateLimiter: RateLimiterMockImpl
	let mockHooks: ScannerLifecycleHook[]
	let mockCredentials: Credentials
	let mockScanFunction: jest.Mock
	let regions: string[]

	beforeEach(() => {
		mockRateLimiter = new RateLimiterMockImpl()
		mockGetRateLimiter = jest.fn().mockReturnValue(mockRateLimiter)
		mockTagsRateLimiter = new RateLimiterMockImpl()
		mockHooks = [createMockedHook(), createMockedHook()]
		mockCredentials = undefined
		mockScanFunction = jest.fn().mockResolvedValue({} as Resources<never>)
		regions = ['eu-west-1', 'eu-west-2', 'us-east-1']

		jest.clearAllMocks()
	})

	it('should return a function', () => {
		const scanner = createRegionalScanner('mockService', mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		expect(scanner).toBeInstanceOf(Function)
	})

	it('should get rate limiter with the correct service name and per region', () => {
		const scanner = createRegionalScanner('mockService', mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		scanner()

		regions.forEach((region) => {
			expect(mockGetRateLimiter).toHaveBeenCalledWith('mockService', region)
		})
	})

	it('should return resources and no errors when scan is successful', async () => {
		const mockResources: Resources<ResourceDescription> = {
			resource1: {id: 'resource1', name: 'Resource 1'},
		}
		mockScanFunction.mockResolvedValue(mockResources)

		const scanner = createRegionalScanner('mockService', mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		const results = await Promise.all(regions.map(scanner))

		results.forEach((result, index) => {
			expect(mockScanFunction).toHaveBeenCalledWith(mockCredentials, mockRateLimiter, regions[index])
			expect(result.resources).toEqual(mockResources)
			expect(result.errors).toEqual([])
		})
	})

	it('should call scan function per region', async () => {
		const mockResources: Resources<ResourceDescription> = {
			resource1: {id: 'resource1', name: 'Resource 1'},
		}
		mockScanFunction.mockResolvedValue(mockResources)

		const scanner = createRegionalScanner('mockService', mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		await Promise.all(regions.map(scanner))

		regions.forEach((region) => {
			expect(mockScanFunction).toHaveBeenCalledWith(mockCredentials, mockRateLimiter, region)
		})
	})

	it('should return errors if scan fails', async () => {
		const mockError = new Error('Mock error')
		mockScanFunction.mockRejectedValue(mockError)

		const scanner = createRegionalScanner('mockService', mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		const results = await Promise.all(regions.map(scanner))

		results.forEach((result, index) => {
			expect(mockGetRateLimiter).toHaveBeenCalledWith('mockService', regions[index])
			expect(mockScanFunction).toHaveBeenCalledWith(mockCredentials, mockRateLimiter, regions[index])
			expect(result.resources).toEqual({})
			expect(result.errors).toEqual(
				regions.map((region) => ({
					service: 'mockService',
					message: mockError.message,
					region,
				})),
			)
		})
	})

	it('should call onStart and onComplete of hooks appropriately during the scan', async () => {
		const mockResources: Resources<ResourceDescription> = {
			resource1: {id: 'resource1', name: 'Resource 1'},
			resource2: {id: 'resource2', name: 'Resource 2'},
		}
		mockScanFunction.mockResolvedValue(mockResources)

		const scanner = createRegionalScanner('mockService', mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		await scanner()

		mockHooks.forEach((hook) => {
			expect(hook.onStart).toHaveBeenCalledTimes(regions.length)
			expect(hook.onComplete).toHaveBeenCalledTimes(regions.length)
			expect(hook.onError).toHaveBeenCalledTimes(0)
		})
	})

	it('should call onError hook if scan fails', async () => {
		const mockError = new Error('Mock error')
		mockScanFunction.mockRejectedValue(mockError)

		const scanner = createRegionalScanner('mockService', mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		await scanner()

		mockHooks.forEach((hook) => {
			expect(hook.onStart).toHaveBeenCalledTimes(regions.length)
			expect(hook.onComplete).toHaveBeenCalledTimes(0)
			expect(hook.onError).toHaveBeenCalledTimes(regions.length)
		})
	})
})
