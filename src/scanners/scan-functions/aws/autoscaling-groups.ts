import {AutoScalingClient, DescribeAutoScalingGroupsCommand, AutoScalingGroup} from '@aws-sdk/client-auto-scaling'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

async function getAutoScalingGroups(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AutoScalingGroup[]> {
	const client = new AutoScalingClient({credentials, region})

	const autoScalingGroups: AutoScalingGroup[] = []

	let nextToken: string | undefined
	do {
		const describeAutoScalingGroupsCommand = new DescribeAutoScalingGroupsCommand({
			MaxRecords: 100,
			NextToken: nextToken,
		})

		const describeAutoScalingGroupsResponse = await rateLimiter.throttle(() =>
			client.send(describeAutoScalingGroupsCommand),
		)

		if (describeAutoScalingGroupsResponse.AutoScalingGroups) {
			autoScalingGroups.push(...describeAutoScalingGroupsResponse.AutoScalingGroups)
		}

		nextToken = describeAutoScalingGroupsResponse.NextToken
	} while (nextToken)

	return autoScalingGroups
}

export async function getAutoScalingResources(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.AUTOSCALING_GROUPS>> {
	const autoScalingGroups = await getAutoScalingGroups(credentials, rateLimiter, region)

	return autoScalingGroups.reduce((acc, autoScalingGroup) => {
		if (!autoScalingGroup.AutoScalingGroupARN) {
			throw new Error('AutoScalingGroupARN is missing in the response')
		}

		acc[autoScalingGroup.AutoScalingGroupARN] = autoScalingGroup
		return acc
	}, {} as AwsResources<AwsServices.AUTOSCALING_GROUPS>)
}
