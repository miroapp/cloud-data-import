import {AthenaClient, ListNamedQueriesCommand, GetNamedQueryCommand, NamedQuery} from '@aws-sdk/client-athena'
import {Credentials, Resources} from '@/types'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {buildARN} from './common/buildArn'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getAthenaNamedQueries(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<NamedQuery>> {
	const client = new AthenaClient({credentials, region})
	const accountId = await getAwsAccountId()

	const resources: Resources<NamedQuery> = {}
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
