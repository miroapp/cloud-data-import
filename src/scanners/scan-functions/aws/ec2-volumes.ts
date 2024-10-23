import {EC2Client, DescribeVolumesCommand} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2Volumes(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.EC2_VOLUMES>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeVolumesCommand = new DescribeVolumesCommand({})
	const describeVolumesResponse = await rateLimiter.throttle(() => client.send(describeVolumesCommand))
	const volumes = describeVolumesResponse.Volumes || []

	const resources: AwsResources<AwsServices.EC2_VOLUMES> = {}

	for (const volume of volumes) {
		if (volume.VolumeId) {
			const arn = buildARN({
				service: 'ec2',
				region,
				accountId,
				resource: `volume/${volume.VolumeId}`,
			})
			resources[arn] = volume
		}
	}
	return resources
}
