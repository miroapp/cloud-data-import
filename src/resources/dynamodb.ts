import { DynamoDBClient, ListTablesCommand, DescribeTableCommand, TableDescription } from "@aws-sdk/client-dynamodb";
import { Credentials, Resources } from "../types";
import { RateLimiter } from "../utils/RateLimiter";

async function getDynamoDBTables(credentials: Credentials, rateLimiter: RateLimiter, region: string): Promise<TableDescription[]> {
  const client = new DynamoDBClient([{ credentials, region }]);

  const tableDescriptions: TableDescription[] = [];

  let exclusiveStartTableName: string | undefined;
  do {
    const listTablesCommand = new ListTablesCommand({
      Limit: 100,
      ExclusiveStartTableName: exclusiveStartTableName,
    });

    const listTablesResponse = await rateLimiter.throttle(() => client.send(listTablesCommand));

    if (listTablesResponse.TableNames) {
      for (const tableName of listTablesResponse.TableNames) {
        const describeTableCommand = new DescribeTableCommand({
          TableName: tableName,
        });

        const describeTableResponse = await rateLimiter.throttle(() => client.send(describeTableCommand));

        if (describeTableResponse.Table) {
          tableDescriptions.push(describeTableResponse.Table);
        }
      }
    }

    exclusiveStartTableName = listTablesResponse.LastEvaluatedTableName;
  } while (exclusiveStartTableName);

  return tableDescriptions;
}



export async function getDynamoDBResources(credentials: Credentials, rateLimiter: RateLimiter, region: string): Promise<Resources<TableDescription>> {
  const tables = await getDynamoDBTables(credentials, rateLimiter, region);

  return tables.reduce((acc, table) => {
    if (!table.TableArn) {
      throw new Error('TableArn is missing in the response');
    }

    acc[table.TableArn] = table;
    return acc;
  }, {} as Resources<TableDescription>);
}