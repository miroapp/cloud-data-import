import {createGlobalScanner} from '@/scanners'
import {AwsResources, AwsCredentials, AwsScannerLifecycleHook} from '@/types'

import {RateLimiterMockImpl} from 'tests/mocks/RateLimiterMock'
import {createMockedHook} from 'tests/mocks/hookMock'
import {fetchTags} from '@/scanners/common/fetchTags'
import {AwsServices} from '@/constants'

jest.mock('@/scanners/common/fetchTags')

describe('createGlobalScanner', () => {
	let mockRateLimiter: RateLimiterMockImpl
	let mockGetRateLimiter: jest.Mock
	let mockTagsRateLimiter: RateLimiterMockImpl
	let mockHooks: AwsScannerLifecycleHook[]
	let mockCredentials: AwsCredentials
	let mockScanFunction: jest.Mock

	beforeEach(() => {
		mockRateLimiter = new RateLimiterMockImpl()
		mockGetRateLimiter = jest.fn().mockReturnValue(mockRateLimiter)
		mockTagsRateLimiter = new RateLimiterMockImpl()
		mockHooks = [createMockedHook(), createMockedHook()]
		mockCredentials = undefined
		mockScanFunction = jest.fn().mockResolvedValue({} as AwsResources<never>)
		;(fetchTags as jest.Mock).mockResolvedValue({})

		jest.clearAllMocks()
	})

	it('should return a function', () => {
		const scanner = createGlobalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		expect(scanner).toBeInstanceOf(Function)
	})

	it('should get rate limiter with the correct service name', () => {
		const scanner = createGlobalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		scanner()

		expect(mockGetRateLimiter).toHaveBeenCalledWith(AwsServices.ATHENA_NAMED_QUERIES)
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

		const scanner = createGlobalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		const result = await scanner()

		expect(mockScanFunction).toHaveBeenCalledWith(mockCredentials, mockRateLimiter)
		expect(result).toEqual({resources: mockResources, tags: {}, errors: []})
	})

	it('should return errors if scan fails', async () => {
		const mockError = new Error('Mock error')
		mockScanFunction.mockRejectedValue(mockError)

		const scanner = createGlobalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		const result = await scanner()

		expect(mockGetRateLimiter).toHaveBeenCalledWith(AwsServices.ATHENA_NAMED_QUERIES)
		expect(mockScanFunction).toHaveBeenCalledWith(mockCredentials, mockRateLimiter)
		expect(result).toEqual({
			resources: {} as AwsResources<never>,
			tags: {},
			errors: [{service: AwsServices.ATHENA_NAMED_QUERIES, message: mockError.message}],
		})
	})

	it('should call hooks appropriately during the scan', async () => {
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

		const scanner = createGlobalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		await scanner()

		mockHooks.forEach((hook) => {
			expect(hook.onStart).toHaveBeenCalledTimes(1)
			expect(hook.onComplete).toHaveBeenCalledTimes(1)
			expect(hook.onError).not.toHaveBeenCalled()

			expect(hook.onStart).toHaveBeenCalledWith(AwsServices.ATHENA_NAMED_QUERIES)
			expect(hook.onComplete).toHaveBeenCalledWith(mockResources, AwsServices.ATHENA_NAMED_QUERIES)
		})
	})

	it('should call onError hook if scan fails', async () => {
		const mockError = new Error('Mock error')
		mockScanFunction.mockRejectedValue(mockError)

		const scanner = createGlobalScanner(AwsServices.ATHENA_NAMED_QUERIES, mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockTagsRateLimiter,
			hooks: mockHooks,
		})

		await scanner()

		mockHooks.forEach((hook) => {
			expect(hook.onStart).toHaveBeenCalledTimes(1)
			expect(hook.onComplete).not.toHaveBeenCalled()
			expect(hook.onError).toHaveBeenCalledTimes(1)

			expect(hook.onStart).toHaveBeenCalledWith(AwsServices.ATHENA_NAMED_QUERIES)
			expect(hook.onError).toHaveBeenCalledWith(mockError, AwsServices.ATHENA_NAMED_QUERIES)
		})
	})
})
