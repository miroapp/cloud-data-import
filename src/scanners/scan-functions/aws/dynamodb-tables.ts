import {DynamoDBClient, ListTablesCommand, DescribeTableCommand} from '@aws-sdk/client-dynamodb'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getDynamoDBTables(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.DYNAMODB_TABLES>> {
	const client = new DynamoDBClient({credentials, region})

	const resources: AwsResources<AwsServices.DYNAMODB_TABLES> = {}

	let lastEvaluatedTableName: string | undefined
	do {
		const listTablesCommand = new ListTablesCommand({
			ExclusiveStartTableName: lastEvaluatedTableName,
		})

		const listTablesResponse = await rateLimiter.throttle(() => client.send(listTablesCommand))

		if (listTablesResponse.TableNames) {
			for (const tableName of listTablesResponse.TableNames) {
				const describeTableCommand = new DescribeTableCommand({TableName: tableName})
				const describeTableResponse = await rateLimiter.throttle(() => client.send(describeTableCommand))

				if (describeTableResponse.Table && describeTableResponse.Table.TableArn) {
					resources[describeTableResponse.Table.TableArn] = describeTableResponse.Table
				} else {
					throw new Error('Table or TableArn is missing in the response')
				}
			}
		}

		lastEvaluatedTableName = listTablesResponse.LastEvaluatedTableName
	} while (lastEvaluatedTableName)

	return resources
}
