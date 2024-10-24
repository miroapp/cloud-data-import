import {ListTopicsCommand, SNSClient} from '@aws-sdk/client-sns'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getSNSTopics(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.SNS_TOPICS>> {
	const client = new SNSClient({credentials, region})
	const topics: AwsResources<AwsServices.SNS_TOPICS> = {}

	let nextToken: string | undefined
	do {
		const command = new ListTopicsCommand({
			NextToken: nextToken,
		})

		const response = await rateLimiter.throttle(() => client.send(command))

		nextToken = response.NextToken

		response.Topics?.forEach((topic) => {
			if (!topic.TopicArn) {
				throw new Error('TopicArn is missing in the response')
			}

			topics[topic.TopicArn] = topic
		})
	} while (nextToken)

	return topics
}
