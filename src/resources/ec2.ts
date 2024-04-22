import { EC2Client, DescribeInstancesCommand, Instance } from "@aws-sdk/client-ec2";
import { EC2Schema } from "../types";

async function getEC2Instances(region: string): Promise<Instance[]> {
  const client = new EC2Client({ region });
  const instances: Instance[] = [];

  let nextToken: string | undefined;
  do {
    const command = new DescribeInstancesCommand({
      MaxResults: 100,
      NextToken: nextToken,
    });

    const response = await client.send(command);

    response.Reservations?.forEach((reservation) => {
      reservation.Instances?.forEach((instance) => {
        instances.push(instance);
      });
    });

    nextToken = response.NextToken;
  } while (nextToken);

  return instances;
}


export async function getEC2Resources(region: string): Promise<EC2Schema> {
    return {
        instances: await getEC2Instances(region),
    }
}