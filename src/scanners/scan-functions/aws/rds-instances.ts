import {RDSClient, DescribeDBInstancesCommand} from '@aws-sdk/client-rds'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getRDSInstances(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.RDS_INSTANCES>> {
	const client = new RDSClient({credentials, region})

	const dbInstances: AwsResourcesList<AwsSupportedResources.RDS_INSTANCES> = {}

	let marker: string | undefined
	do {
		const describeDBInstancesCommand = new DescribeDBInstancesCommand({
			MaxRecords: 100,
			Marker: marker,
		})

		const describeDBInstancesResponse = await rateLimiter.throttle(() => client.send(describeDBInstancesCommand))

		if (describeDBInstancesResponse.DBInstances) {
			for (const instance of describeDBInstancesResponse.DBInstances) {
				if (!instance.DBInstanceArn) {
					throw new Error('DBInstanceArn is missing in the response')
				}

				dbInstances[instance.DBInstanceArn] = instance
			}
		}

		marker = describeDBInstancesResponse.Marker
	} while (marker)

	return dbInstances
}
