import {EC2Client, DescribeVpcEndpointsCommand, VpcEndpoint} from '@aws-sdk/client-ec2'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {buildARN} from './common/buildArn'
import {Credentials, Resources} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2VpcEndpoints(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<VpcEndpoint>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId()

	const describeVpcEndpointsCommand = new DescribeVpcEndpointsCommand({})
	const describeVpcEndpointsResponse = await rateLimiter.throttle(() => client.send(describeVpcEndpointsCommand))
	const vpcEndpoints: VpcEndpoint[] = describeVpcEndpointsResponse.VpcEndpoints || []

	const resources: {[arn: string]: VpcEndpoint} = {}
	for (const vpcEndpoint of vpcEndpoints) {
		if (vpcEndpoint.VpcEndpointId) {
			const arn = buildARN({
				service: 'ec2',
				region,
				accountId,
				resource: `vpc-endpoint/${vpcEndpoint.VpcEndpointId}`,
			})
			resources[arn] = vpcEndpoint
		}
	}
	return resources
}
