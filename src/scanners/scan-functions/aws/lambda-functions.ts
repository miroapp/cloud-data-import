import {LambdaClient, ListFunctionsCommand} from '@aws-sdk/client-lambda'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getLambdaFunctions(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.LAMBDA_FUNCTIONS>> {
	const client = new LambdaClient({credentials, region})

	const resources: AwsResources<AwsServices.LAMBDA_FUNCTIONS> = {}

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
