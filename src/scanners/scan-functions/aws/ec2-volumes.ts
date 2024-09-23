import {EC2Client, DescribeVolumesCommand, Volume} from '@aws-sdk/client-ec2'
import {buildARN} from './common/buildArn'
import {Credentials, Resources, RateLimiter} from '@/types'
import {getAwsAccountId} from './common/getAwsAccountId'

export async function getEC2Volumes(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<Volume>> {
	const client = new EC2Client({credentials, region})

	const accountId = await getAwsAccountId(credentials)

	const describeVolumesCommand = new DescribeVolumesCommand({})
	const describeVolumesResponse = await rateLimiter.throttle(() => client.send(describeVolumesCommand))
	const volumes: Volume[] = describeVolumesResponse.Volumes || []

	const resources: {[arn: string]: Volume} = {}
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
