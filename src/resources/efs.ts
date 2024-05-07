import { 
    EFSClient, 
    DescribeFileSystemsCommand, 
    DescribeFileSystemPolicyCommand,
    DescribeLifecycleConfigurationCommand,
    DescribeMountTargetsCommand,
    FileSystemDescription,
    FileSystemPolicyDescription,
    LifecycleConfigurationDescription,
    MountTargetDescription,
  } from "@aws-sdk/client-efs";
  import { Resources } from "../types";
  import { buildARN } from "../utils/buildARN";
  import { getAccountId } from "../utils/getAccountId";
  
  interface ExtendedFileSystem extends FileSystemDescription {
    ARN: string;
    Policy?: FileSystemPolicyDescription;
    LifecycleConfiguration?: LifecycleConfigurationDescription;
    MountTargets?: MountTargetDescription[];
  }
  
  async function getEFSFileSystems(region: string): Promise<ExtendedFileSystem[]> {
    const client = new EFSClient({ region });
    const accountId = await getAccountId();
  
    const command = new DescribeFileSystemsCommand({});
    const response = await client.send(command);
  
    const enrichedFileSystems = await Promise.all(
      (response.FileSystems || []).map(async (fileSystem) => {
        const arn = buildARN({
            accountId,
            region,
            service: 'efs',
            resource: `filesystem/${fileSystem.FileSystemId}`,
        });

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
          ARN: arn,
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
      acc[fileSystem.ARN] = fileSystem
      return acc;
    }, {} as Resources<ExtendedFileSystem>);
  }
  