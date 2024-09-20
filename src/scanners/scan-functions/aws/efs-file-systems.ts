import {EFSClient, DescribeFileSystemsCommand, FileSystemDescription} from '@aws-sdk/client-efs'
import {Credentials, Resources, RateLimiter} from '@/types'

export async function getEFSFileSystems(
	credentials: Credentials,
	rateLimiter: RateLimiter,
	region: string,
): Promise<Resources<FileSystemDescription>> {
	const client = new EFSClient({credentials, region})

	const describeFileSystemsCommand = new DescribeFileSystemsCommand({})
	const describeFileSystemsResponse = await rateLimiter.throttle(() => client.send(describeFileSystemsCommand))
	const fileSystems: FileSystemDescription[] = describeFileSystemsResponse.FileSystems || []

	const resources: {[arn: string]: FileSystemDescription} = {}
	for (const fileSystem of fileSystems) {
		if (fileSystem.FileSystemArn) {
			resources[fileSystem.FileSystemArn] = fileSystem
		} else {
			throw new Error('FileSystemArn is missing in the response')
		}
	}

	return resources
}
