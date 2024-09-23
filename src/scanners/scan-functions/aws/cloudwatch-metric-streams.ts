import {CloudWatchClient, ListMetricStreamsCommand, MetricStreamEntry} from '@aws-sdk/client-cloudwatch'
import {Credentials, Resources, RateLimiter} from '@/types'

export async function getCloudWatchMetricStreams(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<MetricStreamEntry>> {
	const client = new CloudWatchClient({credentials, region})

	const resources: {[arn: string]: MetricStreamEntry} = {}

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
