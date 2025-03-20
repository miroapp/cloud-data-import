import {CloudWatchClient, ListMetricStreamsCommand} from '@aws-sdk/client-cloudwatch'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getCloudWatchMetricStreams(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.CLOUDWATCH_METRIC_STREAMS>> {
	const client = new CloudWatchClient({credentials, region})

	const resources: AwsResourcesList<AwsSupportedResources.CLOUDWATCH_METRIC_STREAMS> = {}

	let nextToken: string | undefined
	do {
		const listMetricStreamsCommand = new ListMetricStreamsCommand({
			NextToken: nextToken,
		})

		const listMetricStreamsResponse = await rateLimiter.throttle(() => client.send(listMetricStreamsCommand))

		if (listMetricStreamsResponse.Entries) {
			for (const metricStream of listMetricStreamsResponse.Entries) {
				if (metricStream.Arn) {
					resources[metricStream.Arn] = metricStream
				} else {
					throw new Error('Metric Stream ARN or Name is missing in the response')
				}
			}
		}

		nextToken = listMetricStreamsResponse.NextToken
	} while (nextToken)

	return resources
}
