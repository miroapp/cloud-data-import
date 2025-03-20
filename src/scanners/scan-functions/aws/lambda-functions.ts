import {LambdaClient, ListFunctionsCommand} from '@aws-sdk/client-lambda'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getLambdaFunctions(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.LAMBDA_FUNCTIONS>> {
	const client = new LambdaClient({credentials, region})

	const resources: AwsResourcesList<AwsSupportedResources.LAMBDA_FUNCTIONS> = {}

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
