import {createRateLimiterFactory} from '@/aws-app/utils/createRateLimiterFactory'
import {AwsSupportedResources} from '@/definitions/supported-services'
import {AWSRateLimitExhaustionRetryStrategy} from '@/lib'
import {createRateLimiter} from '@/scanners'

jest.mock('@/scanners', () => ({
	createRateLimiter: jest.fn(() => ({
		schedule: jest.fn(),
	})),
}))

describe('createRateLimiterFactory', () => {
	const retryStrategy = new AWSRateLimitExhaustionRetryStrategy()
	let getRateLimiter: ReturnType<typeof createRateLimiterFactory>

	beforeEach(() => {
		getRateLimiter = createRateLimiterFactory(10, retryStrategy)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should create and return a RateLimiter for a given service and region', () => {
		const service = AwsSupportedResources.EC2_INSTANCES
		const region = 'us-east-1'
		const rateLimiter = getRateLimiter(service, region)

		expect(createRateLimiter).toHaveBeenCalledWith(10, retryStrategy)
		expect(rateLimiter).toBeDefined()
	})

	it('should reuse the RateLimiter for the same service and region', () => {
		const service = AwsSupportedResources.EC2_INSTANCES
		const region = 'us-east-1'

		const rateLimiter1 = getRateLimiter(service, region)
		const rateLimiter2 = getRateLimiter(service, region)

		expect(rateLimiter1).toBe(rateLimiter2)
		expect(createRateLimiter).toHaveBeenCalledTimes(1)
	})

	it('should create separate RateLimiters for different regions', () => {
		const service = AwsSupportedResources.EC2_INSTANCES
		const region1 = 'us-east-1'
		const region2 = 'eu-west-1'

		const rateLimiter1 = getRateLimiter(service, region1)
		const rateLimiter2 = getRateLimiter(service, region2)

		expect(rateLimiter1).not.toBe(rateLimiter2)
		expect(createRateLimiter).toHaveBeenCalledTimes(2)
	})

	it('should create and return a RateLimiter for a shared service name without region', () => {
		const service1 = AwsSupportedResources.EC2_INSTANCES
		const service2 = AwsSupportedResources.EC2_INSTANCES

		const rateLimiter1 = getRateLimiter(service1)
		const rateLimiter2 = getRateLimiter(service2)

		expect(rateLimiter1).toBe(rateLimiter2)
		expect(createRateLimiter).toHaveBeenCalledTimes(1)
	})

	it('should create separate RateLimiters for different services without region', () => {
		const service1 = AwsSupportedResources.EC2_INSTANCES
		const service2 = AwsSupportedResources.RDS_CLUSTERS

		const rateLimiter1 = getRateLimiter(service1)
		const rateLimiter2 = getRateLimiter(service2)

		expect(rateLimiter1).not.toBe(rateLimiter2)
		expect(createRateLimiter).toHaveBeenCalledTimes(2)
	})
})
