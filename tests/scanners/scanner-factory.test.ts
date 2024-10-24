import {AwsServices} from '@/constants'
import {getAllAwsScanners, getAwsScanner} from '@/scanners'
import {scannerConfigs} from '@/scanners/scanner-configs'
import type {AwsCredentials, AwsScannerLifecycleHook} from '@/types'
import {createMockedHook} from 'tests/mocks/hookMock'

// Mock the constants module
jest.mock('@/constants', () => ({
	AwsServices: {
		EC2_INSTANCES: 'EC2_INSTANCES',
		S3_BUCKETS: 'S3_BUCKETS',
		CLOUDFRONT_DISTRIBUTIONS: 'CLOUDFRONT_DISTRIBUTIONS',
		ROUTE53_HOSTED_ZONES: 'ROUTE53_HOSTED_ZONES',
	},
}))

// Mock the common scanner creators
jest.mock('@/scanners/common/createRegionalScanner', () => ({
	createRegionalScanner: jest.fn().mockReturnValue(() => Promise.resolve({resources: {}, tags: {}, errors: []})),
}))

jest.mock('@/scanners/common/createGlobalScanner', () => ({
	createGlobalScanner: jest.fn().mockReturnValue(() => Promise.resolve({resources: {}, tags: {}, errors: []})),
}))

// Mock scanner configs
jest.mock('@/scanners/scanner-configs', () => ({
	scannerConfigs: {
		['EC2_INSTANCES']: {
			service: 'EC2_INSTANCES',
			handler: jest.fn(),
			global: false,
		},
		['S3_BUCKETS']: {
			service: 'S3_BUCKETS',
			handler: jest.fn(),
			global: true,
		},
		['CLOUDFRONT_DISTRIBUTIONS']: {
			service: 'CLOUDFRONT_DISTRIBUTIONS',
			handler: jest.fn(),
			global: true,
		},
		['ROUTE53_HOSTED_ZONES']: {
			service: 'ROUTE53_HOSTED_ZONES',
			handler: jest.fn(),
			global: true,
		},
	},
}))

describe('AWS Scanner Factory', () => {
	let mockCredentials: AwsCredentials
	let mockGetRateLimiter: jest.Mock
	let mockHooks: AwsScannerLifecycleHook[]
	let regions: string[]
	let createRegionalScannerSpy: jest.SpyInstance
	let createGlobalScannerSpy: jest.SpyInstance

	beforeEach(() => {
		mockCredentials = {
			accessKeyId: 'mockAccessKeyId',
			secretAccessKey: 'mockSecretAccessKey',
		}
		mockGetRateLimiter = jest.fn().mockReturnValue(jest.fn())
		mockHooks = [createMockedHook(), createMockedHook()]
		regions = ['us-east-1', 'eu-west-1']

		const {createRegionalScanner} = require('@/scanners/common/createRegionalScanner')
		const {createGlobalScanner} = require('@/scanners/common/createGlobalScanner')

		createRegionalScannerSpy = createRegionalScanner
		createGlobalScannerSpy = createGlobalScanner

		jest.clearAllMocks()
	})

	describe('getAwsScanner', () => {
		it('should create a regional scanner for EC2 instances', () => {
			const scanner = getAwsScanner({
				service: AwsServices.EC2_INSTANCES,
				credentials: mockCredentials,
				getRateLimiter: mockGetRateLimiter,
				hooks: mockHooks,
				regions,
			})

			expect(createRegionalScannerSpy).toHaveBeenCalledWith(
				AwsServices.EC2_INSTANCES,
				expect.any(Function),
				regions,
				expect.objectContaining({
					credentials: mockCredentials,
					getRateLimiter: mockGetRateLimiter,
					tagsRateLimiter: expect.any(Function),
					hooks: mockHooks,
				}),
			)
			expect(scanner).toBeInstanceOf(Function)
		})

		it('should create a global scanner for S3 buckets', () => {
			const scanner = getAwsScanner({
				service: AwsServices.S3_BUCKETS,
				credentials: mockCredentials,
				getRateLimiter: mockGetRateLimiter,
				hooks: mockHooks,
				regions,
			})

			expect(createGlobalScannerSpy).toHaveBeenCalledWith(
				AwsServices.S3_BUCKETS,
				expect.any(Function),
				expect.objectContaining({
					credentials: mockCredentials,
					getRateLimiter: mockGetRateLimiter,
					tagsRateLimiter: expect.any(Function),
					hooks: mockHooks,
				}),
			)
			expect(scanner).toBeInstanceOf(Function)
		})

		it('should handle undefined credentials', () => {
			const scanner = getAwsScanner({
				service: AwsServices.EC2_INSTANCES,
				credentials: undefined,
				getRateLimiter: mockGetRateLimiter,
				hooks: mockHooks,
				regions,
			})

			expect(scanner).toBeInstanceOf(Function)
			expect(createRegionalScannerSpy).toHaveBeenCalledWith(
				expect.any(String),
				expect.any(Function),
				regions,
				expect.objectContaining({
					credentials: undefined,
				}),
			)
		})

		it('should handle empty hooks array', () => {
			const scanner = getAwsScanner({
				service: AwsServices.EC2_INSTANCES,
				credentials: mockCredentials,
				getRateLimiter: mockGetRateLimiter,
				hooks: [],
				regions,
			})

			expect(scanner).toBeInstanceOf(Function)
			expect(createRegionalScannerSpy).toHaveBeenCalledWith(
				expect.any(String),
				expect.any(Function),
				regions,
				expect.objectContaining({
					hooks: [],
				}),
			)
		})

		it('should throw error for invalid service', () => {
			expect(() => {
				getAwsScanner({
					service: 'INVALID_SERVICE' as AwsServices,
					credentials: mockCredentials,
					getRateLimiter: mockGetRateLimiter,
					hooks: mockHooks,
					regions,
				})
			}).toThrow()
		})
	})

	describe('getAllAwsScanners', () => {
		it('should return correct number of scanners when excluding global services', () => {
			const scanners = getAllAwsScanners({
				credentials: mockCredentials,
				getRateLimiter: mockGetRateLimiter,
				hooks: mockHooks,
				regions,
				shouldIncludeGlobalServices: false,
			})

			const expectedCount = Object.values(AwsServices).length - 3 // Subtract global services
			expect(scanners).toHaveLength(expectedCount)
			expect(createGlobalScannerSpy).not.toHaveBeenCalled()
		})

		it('should return all scanners when including global services', () => {
			const scanners = getAllAwsScanners({
				credentials: mockCredentials,
				getRateLimiter: mockGetRateLimiter,
				hooks: mockHooks,
				regions,
				shouldIncludeGlobalServices: true,
			})

			expect(scanners).toHaveLength(Object.values(AwsServices).length)
			expect(createGlobalScannerSpy).toHaveBeenCalled()
		})

		it('should create scanners with consistent configurations', () => {
			const scanners = getAllAwsScanners({
				credentials: mockCredentials,
				getRateLimiter: mockGetRateLimiter,
				hooks: mockHooks,
				regions,
				shouldIncludeGlobalServices: true,
			})

			scanners.forEach((scanner) => {
				expect(scanner).toBeInstanceOf(Function)
			})

			// Verify each scanner was created with correct config
			Object.values(AwsServices).forEach((service) => {
				const config = scannerConfigs[service]
				if (config.global) {
					expect(createGlobalScannerSpy).toHaveBeenCalledWith(
						service,
						expect.any(Function),
						expect.objectContaining({
							credentials: mockCredentials,
							getRateLimiter: mockGetRateLimiter,
							hooks: mockHooks,
						}),
					)
				} else {
					expect(createRegionalScannerSpy).toHaveBeenCalledWith(
						service,
						expect.any(Function),
						regions,
						expect.objectContaining({
							credentials: mockCredentials,
							getRateLimiter: mockGetRateLimiter,
							hooks: mockHooks,
						}),
					)
				}
			})
		})

		it('should handle empty regions array', () => {
			expect(() => {
				getAllAwsScanners({
					credentials: mockCredentials,
					getRateLimiter: mockGetRateLimiter,
					hooks: mockHooks,
					regions: [],
					shouldIncludeGlobalServices: true,
				})
			}).not.toThrow()
		})

		it('should handle rate limiter errors', () => {
			const errorRateLimiter = jest.fn().mockImplementation(() => {
				throw new Error('Rate limiter error')
			})

			expect(() => {
				getAllAwsScanners({
					credentials: mockCredentials,
					getRateLimiter: errorRateLimiter,
					hooks: mockHooks,
					regions,
					shouldIncludeGlobalServices: true,
				})
			}).toThrow('Rate limiter error')
		})
	})
})
