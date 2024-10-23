import {ElasticLoadBalancingClient, DescribeLoadBalancersCommand} from '@aws-sdk/client-elastic-load-balancing'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getELBv1LoadBalancers(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.ELBV1_LOAD_BALANCERS>> {
	const client = new ElasticLoadBalancingClient({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeLoadBalancersCommand = new DescribeLoadBalancersCommand({})
	const describeLoadBalancersResponse = await rateLimiter.throttle(() => client.send(describeLoadBalancersCommand))

	const resources: AwsResources<AwsServices.ELBV1_LOAD_BALANCERS> = {}

	for (const loadBalancer of describeLoadBalancersResponse.LoadBalancerDescriptions || []) {
		if (loadBalancer.LoadBalancerName) {
			const arn = `arn:aws:elasticloadbalancing:${region}:${accountId}:loadbalancer/${loadBalancer.LoadBalancerName}`
			resources[arn] = loadBalancer
		}
	}

	return resources
}
