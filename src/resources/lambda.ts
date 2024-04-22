import { LambdaSchema } from "../types";

export async function getLambdaResources(): Promise<LambdaSchema> {
    return {
        functions: [],
    }
}