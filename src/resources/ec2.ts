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
import { RateLimiter } from "../utils/RateLimiter";

async function getEC2Instances(region: string): Promise<ExtendedInstance[]> {
  const client = new EC2Client({ region });
  const rateLimiter = new RateLimiter(10, 1000);

  const instances: ExtendedInstance[] = [];
  const accountId = await getAccountId();

  let nextToken: string | undefined;
  do {
    const command = new DescribeInstancesCommand({
      MaxResults: 100,
      NextToken: nextToken,
    });

    const response = await rateLimiter.throttle(() => client.send(command))

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

        const getVolumes = async () => client.send(new DescribeVolumesCommand({ Filters: [{ Name: 'attachment.instance-id', Values: [instance.InstanceId!] }] }))
          .then(res => res.Volumes)
          .catch(() => undefined);

        const getVPC = async () => instance.VpcId ? client.send(new DescribeVpcsCommand({ VpcIds: [instance.VpcId] })).then(res => res.Vpcs?.[0]).catch(() => undefined) : undefined;

        const getSubnet = async () => instance.SubnetId ? client.send(new DescribeSubnetsCommand({ SubnetIds: [instance.SubnetId] })).then(res => res.Subnets?.[0]).catch(() => undefined) : undefined;

        const getSecurityGroups = async () => instance.SecurityGroups ? client.send(new DescribeSecurityGroupsCommand({ GroupIds: instance.SecurityGroups.map(sg => sg.GroupId!) })).then(res => res.SecurityGroups).catch(() => undefined) : undefined;

        const [
          volumes,
          vpc,
          subnet,
          securityGroups
        ] = await Promise.all([
          rateLimiter.throttle(getVolumes),
          rateLimiter.throttle(getVPC),
          rateLimiter.throttle(getSubnet),
          rateLimiter.throttle(getSecurityGroups)
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
