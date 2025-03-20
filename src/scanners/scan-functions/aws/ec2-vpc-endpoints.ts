import {EC2Client, DescribeVpcEndpointsCommand} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResourcesList, RateLimiter} from '@/types'
import {AwsSupportedResources} from '@/definitions/supported-services'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2VpcEndpoints(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResourcesList<AwsSupportedResources.EC2_VPC_ENDPOINTS>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeVpcEndpointsCommand = new DescribeVpcEndpointsCommand({})
	const describeVpcEndpointsResponse = await rateLimiter.throttle(() => client.send(describeVpcEndpointsCommand))
	const vpcEndpoints = describeVpcEndpointsResponse.VpcEndpoints || []

	const resources: AwsResourcesList<AwsSupportedResources.EC2_VPC_ENDPOINTS> = {}

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
