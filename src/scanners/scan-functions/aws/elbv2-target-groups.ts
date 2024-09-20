import {
	ElasticLoadBalancingV2Client,
	DescribeTargetGroupsCommand,
	TargetGroup,
} from '@aws-sdk/client-elastic-load-balancing-v2'
import {Credentials, Resources, RateLimiter} from '@/types'

export async function getELBv2TargetGroups(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<TargetGroup>> {
	const client = new ElasticLoadBalancingV2Client({credentials, region})

	const resources: {[arn: string]: TargetGroup} = {}

	let marker: string | undefined
	do {
		const describeTargetGroupsCommand = new DescribeTargetGroupsCommand({
			Marker: marker,
		})

		const describeTargetGroupsResponse = await rateLimiter.throttle(() => client.send(describeTargetGroupsCommand))

		if (describeTargetGroupsResponse.TargetGroups) {
			for (const targetGroup of describeTargetGroupsResponse.TargetGroups) {
				if (targetGroup.TargetGroupArn) {
					resources[targetGroup.TargetGroupArn] = targetGroup
				}
			}
		}

		marker = describeTargetGroupsResponse.NextMarker
	} while (marker)

	return resources
}
