import {
	ElasticLoadBalancingClient,
	DescribeLoadBalancersCommand,
	LoadBalancerDescription,
} from '@aws-sdk/client-elastic-load-balancing'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getELBv1LoadBalancers(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<LoadBalancerDescription>> {
	const client = new ElasticLoadBalancingClient({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeLoadBalancersCommand = new DescribeLoadBalancersCommand({})
	const describeLoadBalancersResponse = await rateLimiter.throttle(() => client.send(describeLoadBalancersCommand))

	const resources: {[arn: string]: LoadBalancerDescription} = {}
	for (const loadBalancer of describeLoadBalancersResponse.LoadBalancerDescriptions || []) {
		if (loadBalancer.LoadBalancerName) {
			const arn = `arn:aws:elasticloadbalancing:${region}:${accountId}:loadbalancer/${loadBalancer.LoadBalancerName}`
			resources[arn] = loadBalancer
		}
	}

	return resources
}
