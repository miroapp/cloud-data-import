import { CloudTrailClient, ListTrailsCommand, Trail } from "@aws-sdk/client-cloudtrail";
import { Resources } from "../types";
import { RateLimiter } from "../utils/RateLimiter";

async function getCloudTrailTrails(): Promise<Trail[]> {
  const client = new CloudTrailClient({});
  const rateLimiter = new RateLimiter(10, 1000)
  
  const trails: Trail[] = [];

  let nextToken: string | undefined;
  do {
    const listTrailsCommand = new ListTrailsCommand({
      NextToken: nextToken,
    });

    const listTrailsResponse = await rateLimiter.throttle(() => client.send(listTrailsCommand));

    if (listTrailsResponse.Trails) {
      trails.push(...listTrailsResponse.Trails);
    }

    nextToken = listTrailsResponse.NextToken;
  } while (nextToken);

  return trails;
}

export async function getCloudTrailResources(): Promise<Resources<Trail>> {
  const trails = await getCloudTrailTrails();

  return trails.reduce((acc, trail) => {
    if (!trail.TrailARN) {
      throw new Error('TrailARN is missing in the response');
    }

    acc[trail.TrailARN] = trail;
    return acc;
  }, {} as Resources<Trail>);
}
