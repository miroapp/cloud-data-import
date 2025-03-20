import {SQSClient, ListQueuesCommand, GetQueueAttributesCommand} from '@aws-sdk/client-sqs'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getSQSQueues(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.SQS_QUEUES>> {
	const client = new SQSClient({credentials, region})

	const resources: AwsResourcesList<AwsSupportedResources.SQS_QUEUES> = {}

	let nextToken: string | undefined
	do {
		const listQueuesCommand = new ListQueuesCommand({
			MaxResults: 100,
			NextToken: nextToken,
		})
		const listQueuesResponse = await rateLimiter.throttle(() => client.send(listQueuesCommand))

		for (const queueUrl of listQueuesResponse.QueueUrls || []) {
			const getQueueAttributesCommand = new GetQueueAttributesCommand({QueueUrl: queueUrl, AttributeNames: ['All']})
			const queueAttributes = await rateLimiter.throttle(() => client.send(getQueueAttributesCommand))

			const attributes = queueAttributes.Attributes

			if (attributes) {
				const queueArn = attributes.QueueArn
				if (queueArn) {
					resources[queueArn] = attributes
				}
			}
		}

		nextToken = listQueuesResponse.NextToken
	} while (nextToken)

	return resources
}
