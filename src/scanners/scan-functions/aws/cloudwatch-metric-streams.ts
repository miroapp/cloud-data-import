import {CloudWatchClient, ListMetricStreamsCommand, MetricStreamEntry} from '@aws-sdk/client-cloudwatch'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {Credentials, Resources} from '@/types'
import {buildARN} from './common/buildArn'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getCloudWatchMetricStreams(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<MetricStreamEntry>> {
	const client = new CloudWatchClient({credentials, region})
	const accountId = await getAwsAccountId()

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
				} else if (metricStream.Name) {
					const arn = buildARN({
						service: 'cloudwatch',
						region,
						accountId,
						resource: `metric-stream/${metricStream.Name}`,
					})
					resources[arn] = metricStream
				} else {
					throw new Error('Metric Stream ARN or Name is missing in the response')
				}
			}
		}

		nextToken = listMetricStreamsResponse.NextToken
	} while (nextToken)

	return resources
}
