import {RDSClient, DescribeDBInstancesCommand} from '@aws-sdk/client-rds'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getRDSInstances(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.RDS_INSTANCES>> {
	const client = new RDSClient({credentials, region})

	const dbInstances: AwsResources<AwsServices.RDS_INSTANCES> = {}

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
