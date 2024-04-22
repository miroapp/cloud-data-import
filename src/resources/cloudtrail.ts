import { CloudTrailClient, ListTrailsCommand, Trail } from "@aws-sdk/client-cloudtrail";
import { CloudTrailSchema } from "../types";

async function getCloudTrailTrails(): Promise<Trail[]> {
  const client = new CloudTrailClient({});
  const trails: Trail[] = [];

  let nextToken: string | undefined;
  do {
    const listTrailsCommand = new ListTrailsCommand({
      NextToken: nextToken,
    });

    const listTrailsResponse = await client.send(listTrailsCommand);

    if (listTrailsResponse.Trails) {
      trails.push(...listTrailsResponse.Trails);
    }

    nextToken = listTrailsResponse.NextToken;
  } while (nextToken);

  return trails;
}

export async function getCloudTrailResources(): Promise<CloudTrailSchema> {
  return {
    trails: await getCloudTrailTrails(),
  };
}
