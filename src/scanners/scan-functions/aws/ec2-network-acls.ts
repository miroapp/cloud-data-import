import {EC2Client, DescribeNetworkAclsCommand, NetworkAcl} from '@aws-sdk/client-ec2'
import {RateLimiter} from '@/scanners/common/RateLimiter'
import {buildARN} from './common/buildArn'
import {Credentials, Resources} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2NetworkAcls(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<NetworkAcl>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId()

	const describeNetworkAclsCommand = new DescribeNetworkAclsCommand({})
	const describeSubnetsResponse = await rateLimiter.throttle(() => client.send(describeNetworkAclsCommand))
	const acls: NetworkAcl[] = describeSubnetsResponse.NetworkAcls || []

	const resources: {[arn: string]: NetworkAcl} = {}
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
