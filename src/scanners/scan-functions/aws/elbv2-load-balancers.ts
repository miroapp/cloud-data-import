import {
	ElasticLoadBalancingV2,
	DescribeLoadBalancersCommand,
	LoadBalancer,
} from '@aws-sdk/client-elastic-load-balancing-v2'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'

export async function getELBv2LoadBalancers(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<LoadBalancer>> {
	const client = new ElasticLoadBalancingV2({credentials, region})

	const describeLoadBalancersCommand = new DescribeLoadBalancersCommand({})
	const describeLoadBalancersResponse = await rateLimiter.throttle(() => client.send(describeLoadBalancersCommand))

	const resources: {[arn: string]: LoadBalancer} = {}
	for (const loadBalancer of describeLoadBalancersResponse.LoadBalancers || []) {
		if (loadBalancer.LoadBalancerArn) {
			resources[loadBalancer.LoadBalancerArn] = loadBalancer
		}
	}

	return resources
}
