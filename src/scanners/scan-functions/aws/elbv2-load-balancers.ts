import {ElasticLoadBalancingV2, DescribeLoadBalancersCommand} from '@aws-sdk/client-elastic-load-balancing-v2'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getELBv2LoadBalancers(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.ELBV2_LOAD_BALANCERS>> {
	const client = new ElasticLoadBalancingV2({credentials, region})

	const describeLoadBalancersCommand = new DescribeLoadBalancersCommand({})
	const describeLoadBalancersResponse = await rateLimiter.throttle(() => client.send(describeLoadBalancersCommand))

	const resources: AwsResources<AwsServices.ELBV2_LOAD_BALANCERS> = {}
	for (const loadBalancer of describeLoadBalancersResponse.LoadBalancers || []) {
		if (loadBalancer.LoadBalancerArn) {
			resources[loadBalancer.LoadBalancerArn] = loadBalancer
		}
	}

	return resources
}
