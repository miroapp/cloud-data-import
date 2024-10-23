import {EFSClient, DescribeFileSystemsCommand, FileSystemDescription} from '@aws-sdk/client-efs'
import {AwsCredentials, AwsResources, RateLimiter} from '@/types'
import {AwsServices} from '@/constants'

export async function getEFSFileSystems(
	credentials: AwsCredentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<AwsResources<AwsServices.EFS_FILE_SYSTEMS>> {
	const client = new EFSClient({credentials, region})

	const describeFileSystemsCommand = new DescribeFileSystemsCommand({})
	const describeFileSystemsResponse = await rateLimiter.throttle(() => client.send(describeFileSystemsCommand))
	const fileSystems: FileSystemDescription[] = describeFileSystemsResponse.FileSystems || []

	const resources: AwsResources<AwsServices.EFS_FILE_SYSTEMS> = {}

	for (const fileSystem of fileSystems) {
		if (fileSystem.FileSystemArn) {
			resources[fileSystem.FileSystemArn] = fileSystem
		} else {
			throw new Error('FileSystemArn is missing in the response')
		}
	}

	return resources
}
