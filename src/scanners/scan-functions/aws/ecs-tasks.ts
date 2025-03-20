import {ECSClient, ListClustersCommand, ListTasksCommand, DescribeTasksCommand} from '@aws-sdk/client-ecs'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getECSTasks(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.ECS_TASKS>> {
	const client = new ECSClient({credentials, region})
	const resources: AwsResourcesList<AwsSupportedResources.ECS_TASKS> = {}

	let clusterNextToken: string | undefined

	do {
		const listClustersCommand = new ListClustersCommand({nextToken: clusterNextToken})
		const listClustersResponse = await rateLimiter.throttle(() => client.send(listClustersCommand))

		const clusterArns = listClustersResponse.clusterArns || []

		for (const clusterArn of clusterArns) {
			let taskNextToken: string | undefined

			do {
				const listTasksCommand = new ListTasksCommand({
					cluster: clusterArn,
					nextToken: taskNextToken,
				})
				const listTasksResponse = await rateLimiter.throttle(() => client.send(listTasksCommand))

				const taskArns = listTasksResponse.taskArns || []

				if (taskArns.length > 0) {
					const describeTasksCommand = new DescribeTasksCommand({
						cluster: clusterArn,
						tasks: taskArns,
					})
					const describeTasksResponse = await rateLimiter.throttle(() => client.send(describeTasksCommand))

					if (describeTasksResponse.tasks) {
						for (const task of describeTasksResponse.tasks) {
							if (task.taskArn) {
								resources[task.taskArn] = task
							} else {
								throw new Error('Task ARN is missing in the response')
							}
						}
					}
				}

				taskNextToken = listTasksResponse.nextToken
			} while (taskNextToken)
		}

		clusterNextToken = listClustersResponse.nextToken
	} while (clusterNextToken)

	return resources
}
