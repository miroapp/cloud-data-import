import {ElasticLoadBalancingV2, DescribeLoadBalancersCommand} from '@aws-sdk/client-elastic-load-balancing-v2'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getELBv2LoadBalancers(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.ELBV2_LOAD_BALANCERS>> {
	const client = new ElasticLoadBalancingV2({credentials, region})

	const describeLoadBalancersCommand = new DescribeLoadBalancersCommand({})
	const describeLoadBalancersResponse = await rateLimiter.throttle(() => client.send(describeLoadBalancersCommand))

	const resources: AwsResourcesList<AwsSupportedResources.ELBV2_LOAD_BALANCERS> = {}
	for (const loadBalancer of describeLoadBalancersResponse.LoadBalancers || []) {
		if (loadBalancer.LoadBalancerArn) {
			resources[loadBalancer.LoadBalancerArn] = loadBalancer
		}
	}

	return resources
}
