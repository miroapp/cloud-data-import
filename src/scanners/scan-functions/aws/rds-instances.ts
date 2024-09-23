import {RDSClient, DescribeDBInstancesCommand, DBInstance} from '@aws-sdk/client-rds'
import {Credentials, Resources, RateLimiter} from '@/types'

export async function getRDSInstances(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<DBInstance>> {
	const client = new RDSClient({credentials, region})

	const dbInstances: Resources<DBInstance> = {}

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
