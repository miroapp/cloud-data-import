import { LambdaClient, ListFunctionsCommand, FunctionConfiguration } from "@aws-sdk/client-lambda";
import { Resources } from "../types";
import { RateLimiter } from "../utils/RateLimiter";

async function getLambdaFunctions(region: string): Promise<FunctionConfiguration[]> {
  const client = new LambdaClient({ region });
  const rateLimiter = new RateLimiter(10, 1000);

  const functionConfigurations: FunctionConfiguration[] = [];

  let marker: string | undefined;
  do {
    const listFunctionsCommand = new ListFunctionsCommand({
      MaxItems: 100,
      Marker: marker,
    });

    const listFunctionsResponse = await rateLimiter.throttle(() => client.send(listFunctionsCommand));

    if (listFunctionsResponse.Functions) {
      functionConfigurations.push(...listFunctionsResponse.Functions);
    }

    marker = listFunctionsResponse.NextMarker;
  } while (marker);

  return functionConfigurations;
}

export async function getLambdaResources(region: string): Promise<Resources<FunctionConfiguration>> {
  const functions = await getLambdaFunctions(region);

  return functions.reduce((acc, func) => {
    if (!func.FunctionArn) {
      throw new Error('FunctionArn is missing in the response');
    }

    acc[func.FunctionArn] = func;
    return acc;
  }, {} as Resources<FunctionConfiguration>);
}
