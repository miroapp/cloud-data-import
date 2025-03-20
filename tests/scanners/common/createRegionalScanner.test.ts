import {createRegionalScanner} from '@/scanners'
import {AwsResourcesList, AwsCredentials, AwsScannerLifecycleHook} from '@/types'

import {RateLimiterMockImpl} from 'tests/mocks/RateLimiterMock'
import {createMockedHook} from 'tests/mocks/hookMock'
import {AwsSupportedResources} from '@/definitions/supported-services'

describe('createRegionalScanner', () => {
	let mockRateLimiter: RateLimiterMockImpl
	let mockGetRateLimiter: jest.Mock
	let mockHooks: AwsScannerLifecycleHook<AwsSupportedResources>[]
	let mockCredentials: AwsCredentials
	let mockScanFunction: jest.Mock
	let regions: string[]

	beforeEach(() => {
		mockRateLimiter = new RateLimiterMockImpl()
		mockGetRateLimiter = jest.fn().mockReturnValue(mockRateLimiter)
		mockHooks = [createMockedHook(), createMockedHook()]
		mockCredentials = undefined
		mockScanFunction = jest.fn().mockResolvedValue({} as AwsResourcesList<never>)
		regions = ['eu-west-1', 'eu-west-2', 'us-east-1']

		jest.clearAllMocks()
	})

	it('should return a function', () => {
		const scanner = createRegionalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		expect(scanner).toBeInstanceOf(Function)
	})

	it('should get rate limiter with the correct service name and per region', () => {
		const scanner = createRegionalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		scanner()

		regions.forEach((region) => {
			expect(mockGetRateLimiter).toHaveBeenCalledWith(AwsSupportedResources.ATHENA_NAMED_QUERIES, region)
		})
	})

	it('should return resources and no errors when scan is successful', async () => {
		const mockResources: AwsResourcesList<AwsSupportedResources.ATHENA_NAMED_QUERIES> = {
			resource1: {
				Name: 'Resource 1',
				Description: 'Resource 1 Description',
				WorkGroup: 'WorkGroup 1',
				Database: 'Database 1',
				QueryString: 'SELECT * FROM table1',
			},
		}
		mockScanFunction.mockResolvedValue(mockResources)

		const scanner = createRegionalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		const results = await Promise.all(regions.map(scanner))

		results.forEach((result, index) => {
			expect(mockScanFunction).toHaveBeenCalledWith(mockCredentials, mockRateLimiter, regions[index])
			expect(result.results).toEqual(mockResources)
			expect(result.errors).toEqual([])
		})
	})

	it('should call scan function per region', async () => {
		const mockResources: AwsResourcesList<AwsSupportedResources.ATHENA_NAMED_QUERIES> = {
			resource1: {
				Name: 'Resource 1',
				Description: 'Resource 1 Description',
				WorkGroup: 'WorkGroup 1',
				Database: 'Database 1',
				QueryString: 'SELECT * FROM table1',
			},
		}
		mockScanFunction.mockResolvedValue(mockResources)

		const scanner = createRegionalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
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

		const scanner = createRegionalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		const results = await Promise.all(regions.map(scanner))

		results.forEach((result, index) => {
			expect(mockGetRateLimiter).toHaveBeenCalledWith(AwsSupportedResources.ATHENA_NAMED_QUERIES, regions[index])
			expect(mockScanFunction).toHaveBeenCalledWith(mockCredentials, mockRateLimiter, regions[index])
			expect(result.results).toEqual({})
			expect(result.errors).toEqual(
				regions.map((region) => ({
					service: AwsSupportedResources.ATHENA_NAMED_QUERIES,
					message: mockError.message,
					region,
				})),
			)
		})
	})

	it('should call onStart and onComplete of hooks appropriately during the scan', async () => {
		const mockResources: AwsResourcesList<AwsSupportedResources.ATHENA_NAMED_QUERIES> = {
			resource1: {
				Name: 'Resource 1',
				Description: 'Resource 1 Description',
				WorkGroup: 'WorkGroup 1',
				Database: 'Database 1',
				QueryString: 'SELECT * FROM table1',
			},
			resource2: {
				Name: 'Resource 2',
				Description: 'Resource 2 Description',
				WorkGroup: 'WorkGroup 2',
				Database: 'Database 2',
				QueryString: 'SELECT * FROM table2',
			},
		}
		mockScanFunction.mockResolvedValue(mockResources)

		const scanner = createRegionalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
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

		const scanner = createRegionalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
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
