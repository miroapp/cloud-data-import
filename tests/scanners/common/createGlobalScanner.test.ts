import {createGlobalScanner} from '@/scanners'
import {AwsResourcesList, AwsCredentials, AwsScannerLifecycleHook} from '@/types'

import {RateLimiterMockImpl} from 'tests/mocks/RateLimiterMock'
import {createMockedHook} from 'tests/mocks/hookMock'
import {AwsSupportedResources} from '@/definitions/supported-services'

describe('createGlobalScanner', () => {
	let mockRateLimiter: RateLimiterMockImpl
	let mockGetRateLimiter: jest.Mock
	let mockHooks: AwsScannerLifecycleHook<AwsSupportedResources>[]
	let mockCredentials: AwsCredentials
	let mockScanFunction: jest.Mock

	beforeEach(() => {
		mockRateLimiter = new RateLimiterMockImpl()
		mockGetRateLimiter = jest.fn().mockReturnValue(mockRateLimiter)
		mockHooks = [createMockedHook(), createMockedHook()]
		mockCredentials = undefined
		mockScanFunction = jest.fn().mockResolvedValue({} as AwsResourcesList<never>)

		jest.clearAllMocks()
	})

	it('should return a function', () => {
		const scanner = createGlobalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		expect(scanner).toBeInstanceOf(Function)
	})

	it('should get rate limiter with the correct service name', () => {
		const scanner = createGlobalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		scanner()

		expect(mockGetRateLimiter).toHaveBeenCalledWith(AwsSupportedResources.ATHENA_NAMED_QUERIES)
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

		const scanner = createGlobalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		const result = await scanner()

		expect(mockScanFunction).toHaveBeenCalledWith(mockCredentials, mockRateLimiter)
		expect(result).toEqual({results: mockResources, errors: []})
	})

	it('should return errors if scan fails', async () => {
		const mockError = new Error('Mock error')
		mockScanFunction.mockRejectedValue(mockError)

		const scanner = createGlobalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		const result = await scanner()

		expect(mockGetRateLimiter).toHaveBeenCalledWith(AwsSupportedResources.ATHENA_NAMED_QUERIES)
		expect(mockScanFunction).toHaveBeenCalledWith(mockCredentials, mockRateLimiter)
		expect(result).toEqual({
			results: {} as AwsResourcesList<never>,
			errors: [{service: AwsSupportedResources.ATHENA_NAMED_QUERIES, message: mockError.message}],
		})
	})

	it('should call hooks appropriately during the scan', async () => {
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

		const scanner = createGlobalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		await scanner()

		mockHooks.forEach((hook) => {
			expect(hook.onStart).toHaveBeenCalledTimes(1)
			expect(hook.onComplete).toHaveBeenCalledTimes(1)
			expect(hook.onError).not.toHaveBeenCalled()

			expect(hook.onStart).toHaveBeenCalledWith(AwsSupportedResources.ATHENA_NAMED_QUERIES)
			expect(hook.onComplete).toHaveBeenCalledWith(mockResources, AwsSupportedResources.ATHENA_NAMED_QUERIES)
		})
	})

	it('should call onError hook if scan fails', async () => {
		const mockError = new Error('Mock error')
		mockScanFunction.mockRejectedValue(mockError)

		const scanner = createGlobalScanner(AwsSupportedResources.ATHENA_NAMED_QUERIES, mockScanFunction, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		await scanner()

		mockHooks.forEach((hook) => {
			expect(hook.onStart).toHaveBeenCalledTimes(1)
			expect(hook.onComplete).not.toHaveBeenCalled()
			expect(hook.onError).toHaveBeenCalledTimes(1)

			expect(hook.onStart).toHaveBeenCalledWith(AwsSupportedResources.ATHENA_NAMED_QUERIES)
			expect(hook.onError).toHaveBeenCalledWith(mockError, AwsSupportedResources.ATHENA_NAMED_QUERIES)
		})
	})
})
