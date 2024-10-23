import {CloudWatchClient, DescribeAlarmsCommand} from '@aws-sdk/client-cloudwatch'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getCloudWatchMetricAlarms(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.CLOUDWATCH_METRIC_ALARMS>> {
	const client = new CloudWatchClient({credentials, region})

	const resources: AwsResources<AwsServices.CLOUDWATCH_METRIC_ALARMS> = {}

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
