import {createRegionalScanner} from '@/scanners'
import {AwsResources, AwsCredentials, AwsScannerLifecycleHook} from '@/types'

import {RateLimiterMockImpl} from 'tests/mocks/RateLimiterMock'
import {createMockedHook} from 'tests/mocks/hookMock'
import {fetchTags} from '@/scanners/common/fetchTags'
import {AwsServices} from '@/constants'

jest.mock('@/scanners/common/fetchTags')

describe('createRegionalScanner', () => {
	let mockRateLimiter: RateLimiterMockImpl
	let mockGetRateLimiter: jest.Mock
	let mockTagsRateLimiter: RateLimiterMockImpl
	let mockHooks: AwsScannerLifecycleHook[]
	let mockCredentials: AwsCredentials
	let mockScanFunction: jest.Mock
	let regions: string[]

	beforeEach(() => {
		mockRateLimiter = new RateLimiterMockImpl()
		mockGetRateLimiter = jest.fn().mockReturnValue(mockRateLimiter)
		mockTagsRateLimiter = new RateLimiterMockImpl()
		mockHooks = [createMockedHook(), createMockedHook()]
		mockCredentials = undefined
		mockScanFunction = jest.fn().mockResolvedValue({} as AwsResources<never>)
		;(fetchTags as jest.Mock).mockResolvedValue({})
		regions = ['eu-west-1', 'eu-west-2', 'us-east-1']

		jest.clearAllMocks()
	})

	it('should return a function', () => {
		const scanner = createRegionalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		expect(scanner).toBeInstanceOf(Function)
	})

	it('should get rate limiter with the correct service name and per region', () => {
		const scanner = createRegionalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		scanner()

		regions.forEach((region) => {
			expect(mockGetRateLimiter).toHaveBeenCalledWith(AwsServices.ATHENA_NAMED_QUERIES, region)
		})
	})

	it('should return resources and no errors when scan is successful', async () => {
		const mockResources: AwsResources<AwsServices.ATHENA_NAMED_QUERIES> = {
			resource1: {
				Name: 'Resource 1',
				Description: 'Resource 1 Description',
				WorkGroup: 'WorkGroup 1',
				Database: 'Database 1',
				QueryString: 'SELECT * FROM table1',
			},
		}
		mockScanFunction.mockResolvedValue(mockResources)

		const scanner = createRegionalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
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
		const mockResources: AwsResources<AwsServices.ATHENA_NAMED_QUERIES> = {
			resource1: {
				Name: 'Resource 1',
				Description: 'Resource 1 Description',
				WorkGroup: 'WorkGroup 1',
				Database: 'Database 1',
				QueryString: 'SELECT * FROM table1',
			},
		}
		mockScanFunction.mockResolvedValue(mockResources)

		const scanner = createRegionalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
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

		const scanner = createRegionalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		const results = await Promise.all(regions.map(scanner))

		results.forEach((result, index) => {
			expect(mockGetRateLimiter).toHaveBeenCalledWith(AwsServices.ATHENA_NAMED_QUERIES, regions[index])
			expect(mockScanFunction).toHaveBeenCalledWith(mockCredentials, mockRateLimiter, regions[index])
			expect(result.resources).toEqual({})
			expect(result.errors).toEqual(
				regions.map((region) => ({
					service: AwsServices.ATHENA_NAMED_QUERIES,
					message: mockError.message,
					region,
				})),
			)
		})
	})

	it('should call onStart and onComplete of hooks appropriately during the scan', async () => {
		const mockResources: AwsResources<AwsServices.ATHENA_NAMED_QUERIES> = {
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

		const scanner = createRegionalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
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

		const scanner = createRegionalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, regions, {
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
