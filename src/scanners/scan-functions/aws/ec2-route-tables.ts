import {EC2Client, DescribeRouteTablesCommand, RouteTable} from '@aws-sdk/client-ec2'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {buildARN} from './common/buildArn'
import {Credentials, Resources} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2RouteTables(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<RouteTable>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeRouteTablesCommand = new DescribeRouteTablesCommand({})
	const describeRouteTablesResponse = await rateLimiter.throttle(() => client.send(describeRouteTablesCommand))
	const routeTables: RouteTable[] = describeRouteTablesResponse.RouteTables || []

	const resources: {[arn: string]: RouteTable} = {}
	for (const routeTable of routeTables) {
		if (routeTable.RouteTableId) {
			const arn = buildARN({
				service: 'ec2',
				region,
				accountId,
				resource: `route-table/${routeTable.RouteTableId}`,
			})
			resources[arn] = routeTable
		}
	}
	return resources
}
