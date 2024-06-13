import {DynamoDBClient, ListTablesCommand, DescribeTableCommand, TableDescription} from '@aws-sdk/client-dynamodb'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'

export async function getDynamoDBTables(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<TableDescription>> {
	const client = new DynamoDBClient({credentials, region})

	const resources: {[arn: string]: TableDescription} = {}

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
