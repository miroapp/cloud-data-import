import { EC2Client, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

async function listEC2Instances() {
  const client = new EC2Client({ region: "eu-west-1" });

  const command = new DescribeInstancesCommand({});

  try {
    const response = await client.send(command);

    response.Reservations?.forEach((reservation) => {
      reservation.Instances?.forEach((instance) => {
        console.log(`Instance ID: ${instance.InstanceId}`);
        console.log(`Instance Type: ${instance.InstanceType}`);
        console.log("--------------------");
      });
    });
  } catch (error) {
    console.error("Error fetching EC2 instances:", error);
  }
}

listEC2Instances();