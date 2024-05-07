import { 
  EC2Client, 
  DescribeInstancesCommand, 
  DescribeVolumesCommand,
  DescribeVpcsCommand,
  DescribeSubnetsCommand,
  DescribeSecurityGroupsCommand,
} from "@aws-sdk/client-ec2";
import { ExtendedInstance, Resources } from "../types";
import { buildARN } from "../utils/buildArn";
import { getAccountId } from "../utils/getAccountId";

async function getEC2Instances(region: string): Promise<ExtendedInstance[]> {
  const client = new EC2Client({ region });
  const instances: ExtendedInstance[] = [];
  const accountId = await getAccountId();

  let nextToken: string | undefined;
  do {
    const command = new DescribeInstancesCommand({
      MaxResults: 100,
      NextToken: nextToken,
    });

    const response = await client.send(command);

    for (const reservation of response.Reservations || []) {
      for (const instance of reservation.Instances || []) {
        if (!instance.InstanceId) {
          throw new Error('InstanceId is missing in the response');
        }

        const arn = buildARN({
          accountId,
          region,
          service: 'ec2',
          resource: `instance/${instance.InstanceId}`,
        });

        const [
          volumes,
          vpc,
          subnet,
          securityGroups
        ] = await Promise.all([
          client.send(new DescribeVolumesCommand({ Filters: [{ Name: 'attachment.instance-id', Values: [instance.InstanceId] }] }))
            .then(res => res.Volumes)
            .catch(() => undefined),
          instance.VpcId ? client.send(new DescribeVpcsCommand({ VpcIds: [instance.VpcId] })).then(res => res.Vpcs?.[0]).catch(() => undefined) : undefined,
          instance.SubnetId ? client.send(new DescribeSubnetsCommand({ SubnetIds: [instance.SubnetId] })).then(res => res.Subnets?.[0]).catch(() => undefined) : undefined,
          instance.SecurityGroups ? client.send(new DescribeSecurityGroupsCommand({ GroupIds: instance.SecurityGroups.map(sg => sg.GroupId!) })).then(res => res.SecurityGroups).catch(() => undefined) : undefined
        ]);

        instances.push({
          ...instance,
          ARN: arn,
          Volumes: volumes,
          Vpc: vpc,
          Subnet: subnet,
          SecurityGroups: securityGroups
        });
      }
    }

    nextToken = response.NextToken;
  } while (nextToken);

  return instances;
}

export async function getEC2Resources(region: string): Promise<Resources<ExtendedInstance>> {
  const instances = await getEC2Instances(region);

  return instances.reduce((acc, instance) => {
    acc[instance.ARN] = instance;
    return acc;
  }, {} as Resources<ExtendedInstance>);
}
