import { CloudTrailClient, ListTrailsCommand, Trail } from "@aws-sdk/client-cloudtrail";
import { Credentials, Resources } from "../types";
import { RateLimiter } from "../utils/RateLimiter";

async function getCloudTrailTrails(
  credentials: Credentials,
  rateLimiter: RateLimiter
): Promise<Trail[]> {
  const client = new CloudTrailClient([{ credentials }]);
  
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

export async function getCloudTrailResources(
  credentials: Credentials,
  rateLimiter: RateLimiter
): Promise<Resources<Trail>> {
  const trails = await getCloudTrailTrails(credentials, rateLimiter);

  return trails.reduce((acc, trail) => {
    if (!trail.TrailARN) {
      throw new Error('TrailARN is missing in the response');
    }

    acc[trail.TrailARN] = trail;
    return acc;
  }, {} as Resources<Trail>);
}
