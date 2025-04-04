import {AthenaClient, ListNamedQueriesCommand, GetNamedQueryCommand} from '@aws-sdk/client-athena'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {buildARN} from './common/buildArn'
import {getAwsAccountId} from './common/getAwsAccountId'
import {AwsSupportedResources} from '@/definitions/supported-services'

export async function getAthenaNamedQueries(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.ATHENA_NAMED_QUERIES>> {
	const client = new AthenaClient({credentials, region})
	const accountId = await getAwsAccountId(credentials)

	const resources: AwsResourcesList<AwsSupportedResources.ATHENA_NAMED_QUERIES> = {}
	let nextToken: string | undefined

	do {
		const listNamedQueriesCommand = new ListNamedQueriesCommand({
			NextToken: nextToken,
		})

		const listNamedQueriesResponse = await rateLimiter.throttle(() => client.send(listNamedQueriesCommand))

		if (listNamedQueriesResponse.NamedQueryIds) {
			for (const queryId of listNamedQueriesResponse.NamedQueryIds) {
				const getNamedQueryCommand = new GetNamedQueryCommand({
					NamedQueryId: queryId,
				})

				const getNamedQueryResponse = await rateLimiter.throttle(() => client.send(getNamedQueryCommand))

				if (getNamedQueryResponse.NamedQuery) {
					const namedQuery = getNamedQueryResponse.NamedQuery
					const arn = buildARN({
						service: 'athena',
						region,
						accountId,
						resource: `workgroup/${namedQuery.WorkGroup}/query/${namedQuery.NamedQueryId}`,
					})
					resources[arn] = namedQuery
				}
			}
		}

		nextToken = listNamedQueriesResponse.NextToken
	} while (nextToken)

	return resources
}
