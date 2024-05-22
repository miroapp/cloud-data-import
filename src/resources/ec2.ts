import { 
  EC2Client, 
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";
import { Credentials, ExtendedInstance, Resources } from "../types";
import { buildARN } from "../utils/buildArn";
import { getAccountId } from "../utils/getAccountId";
import { RateLimiter } from "../utils/RateLimiter";

async function getEC2Instances(credentials: Credentials, rateLimiter: RateLimiter, region: string): Promise<ExtendedInstance[]> {
  const client = new EC2Client({ region });

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

        instances.push({
          ...instance,
          ARN: arn,
        });
      }
    }

    nextToken = response.NextToken;
  } while (nextToken);

  return instances;
}

export async function getEC2Resources(credentials: Credentials, rateLimiter: RateLimiter, region: string): Promise<Resources<ExtendedInstance>> {
  const instances = await getEC2Instances(credentials, rateLimiter, region);

  return instances.reduce((acc, instance) => {
    acc[instance.ARN] = instance;
    return acc;
  }, {} as Resources<ExtendedInstance>);
}
