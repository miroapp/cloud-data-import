import {ListTopicsCommand, SNSClient, Topic} from '@aws-sdk/client-sns'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'

export async function getSNSTopics(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<Topic>> {
	const client = new SNSClient({credentials, region})
	const topics: Resources<Topic> = {}

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
