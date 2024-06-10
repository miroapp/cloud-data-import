import {
	ElasticLoadBalancingV2,
	DescribeLoadBalancersCommand,
	DescribeTargetGroupsCommand,
	LoadBalancer,
	TargetGroup,
} from '@aws-sdk/client-elastic-load-balancing-v2'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'

async function getLoadBalancers(client: ElasticLoadBalancingV2, rateLimiter: RateLimiter): Promise<LoadBalancer[]> {
	const describeLoadBalancersCommand = new DescribeLoadBalancersCommand({})
	const describeLoadBalancersResponse = await rateLimiter.throttle(() => client.send(describeLoadBalancersCommand))

	const loadBalancers: LoadBalancer[] = describeLoadBalancersResponse.LoadBalancers || []

	return loadBalancers
}

async function getTargetGroups(client: ElasticLoadBalancingV2, rateLimiter: RateLimiter): Promise<TargetGroup[]> {
	const describeTargetGroupsCommand = new DescribeTargetGroupsCommand({})
	const describeTargetGroupsResponse = await rateLimiter.throttle(() => client.send(describeTargetGroupsCommand))

	const targetGroups: TargetGroup[] = describeTargetGroupsResponse.TargetGroups || []

	return targetGroups
}

export async function getELBV2Resources(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<LoadBalancer | TargetGroup>> {
	const client = new ElasticLoadBalancingV2({credentials, region})

	const loadBalancers = await getLoadBalancers(client, rateLimiter)
	const targetGroups = await getTargetGroups(client, rateLimiter)

	const resources: Resources<LoadBalancer | TargetGroup> = {}

	for (const loadBalancer of loadBalancers) {
		if (!loadBalancer.LoadBalancerArn) throw new Error('LoadBalancer ARN is missing in the response')
		resources[loadBalancer.LoadBalancerArn] = loadBalancer
	}

	for (const targetGroup of targetGroups) {
		if (!targetGroup.TargetGroupArn) throw new Error('TargetGroup ARN is missing in the response')
		resources[targetGroup.TargetGroupArn] = targetGroup
	}

	return resources
}
