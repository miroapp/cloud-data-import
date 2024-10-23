import {CloudWatchClient, ListMetricStreamsCommand} from '@aws-sdk/client-cloudwatch'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getCloudWatchMetricStreams(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.CLOUDWATCH_METRIC_STREAMS>> {
	const client = new CloudWatchClient({credentials, region})

	const resources: AwsResources<AwsServices.CLOUDWATCH_METRIC_STREAMS> = {}

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
