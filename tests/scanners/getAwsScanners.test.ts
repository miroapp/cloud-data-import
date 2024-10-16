import {Credentials, ScannerLifecycleHook} from '@/types'
import {getAwsScanners} from '@/scanners/getAwsScanners'
import {getAutoScalingResources} from '@/scanners/scan-functions/aws/autoscaling-groups'
import {getCloudFrontDistributions} from '@/scanners/scan-functions/aws/cloudfront-distributions'
import {getEC2Instances} from '@/scanners/scan-functions/aws/ec2-instances'
import {getS3Buckets} from '@/scanners/scan-functions/aws/s3-buckets'
import {createMockedHook} from 'tests/mocks/hookMock'

jest.mock('@/scanners/scan-functions/aws/autoscaling-groups')
jest.mock('@/scanners/scan-functions/aws/cloudfront-distributions')
jest.mock('@/scanners/scan-functions/aws/ec2-instances')
jest.mock('@/scanners/scan-functions/aws/s3-buckets')

describe('getAwsScanners', () => {
	let mockCredentials: Credentials
	let mockGetRateLimiter: jest.Mock

	let mockHooks: ScannerLifecycleHook[]
	let regions: string[]

	let createRegionalScannerSpy: jest.SpyInstance
	let createGlobalScannerSpy: jest.SpyInstance

	beforeEach(() => {
		mockCredentials = {accessKeyId: 'mockAccessKeyId', secretAccessKey: 'mockSecretAccessKey'}
		mockGetRateLimiter = jest.fn()
		mockHooks = [createMockedHook(), createMockedHook()]
		regions = ['us-east-1', 'eu-west-1']

		createRegionalScannerSpy = jest.spyOn(require('@/scanners'), 'createRegionalScanner')
		createGlobalScannerSpy = jest.spyOn(require('@/scanners'), 'createGlobalScanner')

		jest.clearAllMocks()
	})

	it('should return regional scanners only', () => {
		const scanners = getAwsScanners({
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
			regions,
			shouldIncludeGlobalServices: false,
		})

		// It is expected that we have at least one regional scanner
		expect(scanners.length).toBeGreaterThan(0)

		// It is expected that all scanners are functions
		scanners.forEach((scanner) => expect(scanner).toBeInstanceOf(Function))
	})

	it('should return regional and global scanners if global services are included', () => {
		const regionalScanners = getAwsScanners({
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
			regions,
			shouldIncludeGlobalServices: false,
		})

		const allScanners = getAwsScanners({
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
			regions,
			shouldIncludeGlobalServices: true,
		})

		// It is expected that we have at least one global scanner
		expect(allScanners.length - regionalScanners.length).toBeGreaterThan(0)

		// It is expected that all scanners are functions
		allScanners.forEach((scanner) => expect(scanner).toBeInstanceOf(Function))
	})

	it('should call createRegionalScanner with correct arguments', () => {
		getAwsScanners({
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
			regions,
			shouldIncludeGlobalServices: false,
		})

		// Sample calls to createRegionalScanner
		expect(createRegionalScannerSpy).toHaveBeenCalledWith('autoscaling/groups', getAutoScalingResources, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockGetRateLimiter('resource-groups-tagging'),
			hooks: mockHooks,
		})
		expect(createRegionalScannerSpy).toHaveBeenCalledWith('ec2/instances', getEC2Instances, regions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			tagsRateLimiter: mockGetRateLimiter('resource-groups-tagging'),
			hooks: mockHooks,
		})
	})

	it('should call createGlobalScanner with correct arguments if global services are included', () => {
		getAwsScanners({
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
			regions,
			shouldIncludeGlobalServices: true,
		})

		// Sample calls to createGlobalScanner
		expect(createGlobalScannerSpy).toHaveBeenCalledWith('s3/buckets', getS3Buckets, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})

		expect(createGlobalScannerSpy).toHaveBeenCalledWith('cloudfront/distributions', getCloudFrontDistributions, {
			credentials: mockCredentials,
			getRateLimiter: mockGetRateLimiter,
			hooks: mockHooks,
		})
	})
})
