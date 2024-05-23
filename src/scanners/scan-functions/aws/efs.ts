import { 
    EFSClient, 
    DescribeFileSystemsCommand, 
    DescribeFileSystemPolicyCommand,
    DescribeLifecycleConfigurationCommand,
    DescribeMountTargetsCommand,
    FileSystemPolicyDescription,
} from "@aws-sdk/client-efs";
import { Resources, ExtendedFileSystem, Credentials } from "../../../types";
import { RateLimiter } from "../../common/RateLimiter";
  
async function getEFSFileSystems(credentials: Credentials, rateLimiter: RateLimiter, region: string): Promise<ExtendedFileSystem[]> {
    const client = new EFSClient([{ credentials, region }]);
  
    const command = new DescribeFileSystemsCommand({});
    const response = await client.send(command);

    const getFileSystemPolicy = async (fileSystemId: string) => {
        const command = new DescribeFileSystemPolicyCommand({ FileSystemId: fileSystemId });
        return rateLimiter.throttle(() => client.send(command)
            .then(res => res.Policy ? JSON.parse(res.Policy) as FileSystemPolicyDescription : undefined)
            .catch(() => undefined));
    }

    const getLifecycleConfiguration = async (fileSystemId: string) => {
        const command = new DescribeLifecycleConfigurationCommand({ FileSystemId: fileSystemId });
        return rateLimiter.throttle(() => client.send(command)
            .then(res => res.LifecyclePolicies)
            .catch(() => undefined));
    }

    const getMountTargets = async (fileSystemId: string) => {
        const command = new DescribeMountTargetsCommand({ FileSystemId: fileSystemId });
        return rateLimiter.throttle(() => client.send(command)
            .then(res => res.MountTargets)
            .catch(() => undefined));
    }
  
    const enrichedFileSystems = await Promise.all(
      (response.FileSystems || []).map(async (fileSystem) => {
        const [
          fileSystemPolicy,
          LifecyclePolicies,
          mountTargets,
        ] = await Promise.all([
          getFileSystemPolicy(fileSystem.FileSystemId!),
          getLifecycleConfiguration(fileSystem.FileSystemId!),
          getMountTargets(fileSystem.FileSystemId!),
        ]);
  
        return {
          ...fileSystem,
          Policy: fileSystemPolicy,
          LifecycleConfiguration: {
            LifecyclePolicies,
          },
          MountTargets: mountTargets,
        };
      })
    );
  
    return enrichedFileSystems;
}
  
export async function getEFSResources(credentials: Credentials, rateLimiter: RateLimiter, region: string): Promise<Resources<ExtendedFileSystem>> {
    const fileSystems = await getEFSFileSystems(credentials, rateLimiter, region);
  
    return fileSystems.reduce((acc, fileSystem) => {
        if (!fileSystem.FileSystemArn) throw new Error('FileSystemArn is missing in the response');

        acc[fileSystem.FileSystemArn] = fileSystem
        return acc;
    }, {} as Resources<ExtendedFileSystem>);
}
  