import { LambdaClient, ListFunctionsCommand, FunctionConfiguration } from "@aws-sdk/client-lambda";
import { Credentials, Resources } from "../types";
import { RateLimiter } from "../utils/RateLimiter";

async function getLambdaFunctions(credentials: Credentials, rateLimiter: RateLimiter, region: string): Promise<FunctionConfiguration[]> {
  const client = new LambdaClient([{ credentials, region }]);

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

export async function getLambdaResources(credentials: Credentials, rateLimiter: RateLimiter, region: string): Promise<Resources<FunctionConfiguration>> {
  const functions = await getLambdaFunctions(credentials, rateLimiter, region);

  return functions.reduce((acc, func) => {
    if (!func.FunctionArn) {
      throw new Error('FunctionArn is missing in the response');
    }

    acc[func.FunctionArn] = func;
    return acc;
  }, {} as Resources<FunctionConfiguration>);
}
