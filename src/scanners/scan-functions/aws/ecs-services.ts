import {
	ECSClient,
	ListClustersCommand,
	ListServicesCommand,
	DescribeServicesCommand,
	Service,
} from '@aws-sdk/client-ecs'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getECSServices(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.ECS_SERVICES>> {
	const client = new ECSClient({credentials, region})
	const resources: AwsResources<AwsServices.ECS_SERVICES> = {}

	let clusterNextToken: string | undefined

	do {
		const listClustersCommand = new ListClustersCommand({nextToken: clusterNextToken})
		const listClustersResponse = await rateLimiter.throttle(() => client.send(listClustersCommand))

		const clusterArns = listClustersResponse.clusterArns || []

		for (const clusterArn of clusterArns) {
			let serviceNextToken: string | undefined

			do {
				const listServicesCommand = new ListServicesCommand({
					cluster: clusterArn,
					nextToken: serviceNextToken,
				})
				const listServicesResponse = await rateLimiter.throttle(() => client.send(listServicesCommand))

				const serviceArns = listServicesResponse.serviceArns || []

				if (serviceArns.length > 0) {
					const describeServicesCommand = new DescribeServicesCommand({
						cluster: clusterArn,
						services: serviceArns,
					})
					const describeServicesResponse = await rateLimiter.throttle(() => client.send(describeServicesCommand))

					if (describeServicesResponse.services) {
						for (const service of describeServicesResponse.services) {
							if (service.serviceArn) {
								resources[service.serviceArn] = service
							} else {
								throw new Error('Service ARN is missing in the response')
							}
						}
					}
				}

				serviceNextToken = listServicesResponse.nextToken
			} while (serviceNextToken)
		}

		clusterNextToken = listClustersResponse.nextToken
	} while (clusterNextToken)

	return resources
}
