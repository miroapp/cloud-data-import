import {EC2Client, DescribeVpcEndpointsCommand} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2VpcEndpoints(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.EC2_VPC_ENDPOINTS>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeVpcEndpointsCommand = new DescribeVpcEndpointsCommand({})
	const describeVpcEndpointsResponse = await rateLimiter.throttle(() => client.send(describeVpcEndpointsCommand))
	const vpcEndpoints = describeVpcEndpointsResponse.VpcEndpoints || []

	const resources: AwsResources<AwsServices.EC2_VPC_ENDPOINTS> = {}

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
