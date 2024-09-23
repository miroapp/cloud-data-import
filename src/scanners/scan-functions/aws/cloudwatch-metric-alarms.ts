import {CloudWatchClient, DescribeAlarmsCommand, MetricAlarm} from '@aws-sdk/client-cloudwatch'
import {Credentials, Resources, RateLimiter} from '@/types'

export async function getCloudWatchMetricAlarms(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<MetricAlarm>> {
	const client = new CloudWatchClient({credentials, region})

	const resources: {[arn: string]: MetricAlarm} = {}

	let nextToken: string | undefined
	do {
		const describeAlarmsCommand = new DescribeAlarmsCommand({
			NextToken: nextToken,
		})

		const describeAlarmsResponse = await rateLimiter.throttle(() => client.send(describeAlarmsCommand))

		if (describeAlarmsResponse.MetricAlarms) {
			for (const alarm of describeAlarmsResponse.MetricAlarms) {
				if (alarm.AlarmArn) {
					resources[alarm.AlarmArn] = alarm
				} else {
					throw new Error('Alarm ARN is missing in the response')
				}
			}
		}

		nextToken = describeAlarmsResponse.NextToken
	} while (nextToken)

	return resources
}
