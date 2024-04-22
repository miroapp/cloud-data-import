import { getCloudTrailResources } from "./resources/cloudtrail";
import { getS3Resources } from "./resources/s3";
import { OutputSchema } from "./types";

export async function getGlobalResources(): Promise<OutputSchema['global']> {
    const [
        cloudtrail,
        s3,
    ] = await Promise.all([
        getCloudTrailResources(),
        getS3Resources(),
    ]);

    return {
        resources: {
        cloudtrail,
        s3,
        }
    };
}