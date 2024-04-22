import { DynamoDBSchema } from "../types";

export async function getDynamoDBResources(): Promise<DynamoDBSchema> {
    return {
        tables: [],
    }
}