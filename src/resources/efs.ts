import { 
    EFSClient, 
    DescribeFileSystemsCommand, 
    DescribeFileSystemPolicyCommand,
    DescribeLifecycleConfigurationCommand,
    DescribeMountTargetsCommand,
    FileSystemPolicyDescription,
} from "@aws-sdk/client-efs";
import { Resources, ExtendedFileSystem } from "../types";
  
async function getEFSFileSystems(region: string): Promise<ExtendedFileSystem[]> {
    const client = new EFSClient({ region });
  
    const command = new DescribeFileSystemsCommand({});
    const response = await client.send(command);
  
    const enrichedFileSystems = await Promise.all(
      (response.FileSystems || []).map(async (fileSystem) => {
        const [
          fileSystemPolicy,
          LifecyclePolicies,
          mountTargets,
        ] = await Promise.all([
          client.send(new DescribeFileSystemPolicyCommand({ FileSystemId: fileSystem.FileSystemId }))
            .then(res => res.Policy ? JSON.parse(res.Policy) as FileSystemPolicyDescription : undefined)
            .catch(() => undefined),
          client.send(new DescribeLifecycleConfigurationCommand({ FileSystemId: fileSystem.FileSystemId }))
            .then(res => res.LifecyclePolicies)
            .catch(() => undefined),
          client.send(new DescribeMountTargetsCommand({ FileSystemId: fileSystem.FileSystemId }))
            .then(res => res.MountTargets)
            .catch(() => undefined)
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
  
export async function getEFSResources(region: string): Promise<Resources<ExtendedFileSystem>> {
    const fileSystems = await getEFSFileSystems(region);
  
    return fileSystems.reduce((acc, fileSystem) => {
        if (!fileSystem.FileSystemArn) throw new Error('FileSystemArn is missing in the response');

        acc[fileSystem.FileSystemArn] = fileSystem
        return acc;
    }, {} as Resources<ExtendedFileSystem>);
}
  