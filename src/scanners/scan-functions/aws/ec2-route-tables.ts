import {EC2Client, DescribeRouteTablesCommand, RouteTable} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2RouteTables(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.EC2_ROUTE_TABLES>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeRouteTablesCommand = new DescribeRouteTablesCommand({})
	const describeRouteTablesResponse = await rateLimiter.throttle(() => client.send(describeRouteTablesCommand))
	const routeTables: RouteTable[] = describeRouteTablesResponse.RouteTables || []

	const resources: AwsResourcesList<AwsSupportedResources.EC2_ROUTE_TABLES> = {}
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
