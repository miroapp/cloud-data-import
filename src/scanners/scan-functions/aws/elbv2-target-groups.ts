import {ElasticLoadBalancingV2Client, DescribeTargetGroupsCommand} from '@aws-sdk/client-elastic-load-balancing-v2'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getELBv2TargetGroups(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.ELBV2_TARGET_GROUPS>> {
	const client = new ElasticLoadBalancingV2Client({credentials, region})

	const resources: AwsResourcesList<AwsSupportedResources.ELBV2_TARGET_GROUPS> = {}

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
