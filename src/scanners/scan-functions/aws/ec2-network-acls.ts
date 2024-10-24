import {EC2Client, DescribeNetworkAclsCommand, NetworkAcl} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2NetworkAcls(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.EC2_NETWORK_ACLS>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeNetworkAclsCommand = new DescribeNetworkAclsCommand({})
	const describeSubnetsResponse = await rateLimiter.throttle(() => client.send(describeNetworkAclsCommand))
	const acls: NetworkAcl[] = describeSubnetsResponse.NetworkAcls || []

	const resources: AwsResources<AwsServices.EC2_NETWORK_ACLS> = {}

	for (const acl of acls) {
		if (acl.NetworkAclId) {
			const arn = buildARN({
				service: 'ec2',
				region,
				accountId,
				resource: `network-acl/${acl.NetworkAclId}`,
			})
			resources[arn] = acl
		}
	}
	return resources
}
