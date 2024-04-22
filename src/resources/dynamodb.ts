import { DynamoDBClient, ListTablesCommand, DescribeTableCommand, TableDescription } from "@aws-sdk/client-dynamodb";
import { DynamoDBSchema } from "../types";

async function getDynamoDBTables(region: string): Promise<TableDescription[]> {
  const client = new DynamoDBClient({ region });
  const tableDescriptions: TableDescription[] = [];

  let exclusiveStartTableName: string | undefined;
  do {
    const listTablesCommand = new ListTablesCommand({
      Limit: 100,
      ExclusiveStartTableName: exclusiveStartTableName,
    });

    const listTablesResponse = await client.send(listTablesCommand);

    if (listTablesResponse.TableNames) {
      for (const tableName of listTablesResponse.TableNames) {
        const describeTableCommand = new DescribeTableCommand({
          TableName: tableName,
        });

        const describeTableResponse = await client.send(describeTableCommand);

        if (describeTableResponse.Table) {
          tableDescriptions.push(describeTableResponse.Table);
        }
      }
    }

    exclusiveStartTableName = listTablesResponse.LastEvaluatedTableName;
  } while (exclusiveStartTableName);

  return tableDescriptions;
}



export async function getDynamoDBResources(region: string): Promise<DynamoDBSchema> {
    return {
        tables: await getDynamoDBTables(region),
    }
}