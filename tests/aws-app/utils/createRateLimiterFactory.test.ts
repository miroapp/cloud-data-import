import {createRateLimiterFactory} from '@/aws-app/utils/createRateLimiterFactory'
import {createRateLimiter} from '@/scanners'

jest.mock('@/scanners', () => ({
	createRateLimiter: jest.fn(() => ({
		schedule: jest.fn(),
	})),
}))

describe('createRateLimiterFactory', () => {
	let getRateLimiter: ReturnType<typeof createRateLimiterFactory>

	beforeEach(() => {
		getRateLimiter = createRateLimiterFactory(10)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('should create and return a RateLimiter for a given service and region', () => {
		const service = 'ec2/instances'
		const region = 'us-east-1'
		const rateLimiter = getRateLimiter(service, region)

		expect(createRateLimiter).toHaveBeenCalledWith(10)
		expect(rateLimiter).toBeDefined()
	})

	it('should reuse the RateLimiter for the same service and region', () => {
		const service = 'ec2/instances'
		const region = 'us-east-1'

		const rateLimiter1 = getRateLimiter(service, region)
		const rateLimiter2 = getRateLimiter(service, region)

		expect(rateLimiter1).toBe(rateLimiter2)
		expect(createRateLimiter).toHaveBeenCalledTimes(1)
	})

	it('should create separate RateLimiters for different regions', () => {
		const service = 'ec2/instances'
		const region1 = 'us-east-1'
		const region2 = 'eu-west-1'

		const rateLimiter1 = getRateLimiter(service, region1)
		const rateLimiter2 = getRateLimiter(service, region2)

		expect(rateLimiter1).not.toBe(rateLimiter2)
		expect(createRateLimiter).toHaveBeenCalledTimes(2)
	})

	it('should create and return a RateLimiter for a shared service name without region', () => {
		const service1 = 'ec2/instances'
		const service2 = 'ec2/volumes'

		const rateLimiter1 = getRateLimiter(service1)
		const rateLimiter2 = getRateLimiter(service2)

		expect(rateLimiter1).toBe(rateLimiter2)
		expect(createRateLimiter).toHaveBeenCalledTimes(1)
	})

	it('should create separate RateLimiters for different services without region', () => {
		const service1 = 'ec2/instances'
		const service2 = 'rds/clusters'

		const rateLimiter1 = getRateLimiter(service1)
		const rateLimiter2 = getRateLimiter(service2)

		expect(rateLimiter1).not.toBe(rateLimiter2)
		expect(createRateLimiter).toHaveBeenCalledTimes(2)
	})
})
