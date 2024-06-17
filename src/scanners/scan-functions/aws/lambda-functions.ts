import {LambdaClient, ListFunctionsCommand, GetFunctionCommand, FunctionConfiguration} from '@aws-sdk/client-lambda'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'

export async function getLambdaFunctions(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<FunctionConfiguration>> {
	const client = new LambdaClient({credentials, region})

	const resources: {[arn: string]: FunctionConfiguration} = {}

	let marker: string | undefined
	do {
		const listFunctionsCommand = new ListFunctionsCommand({
			Marker: marker,
		})

		const listFunctionsResponse = await rateLimiter.throttle(() => client.send(listFunctionsCommand))

		if (listFunctionsResponse.Functions) {
			for (const lambdaFunction of listFunctionsResponse.Functions) {
				if (lambdaFunction.FunctionArn) {
					resources[lambdaFunction.FunctionArn] = lambdaFunction
				} else {
					throw new Error('Function ARN is missing in the response')
				}
			}
		}

		marker = listFunctionsResponse.NextMarker
	} while (marker)

	return resources
}
