import { getCloudTrailResources } from "./resources/cloudtrail";
import { getS3Resources } from "./resources/s3";
import { Resources } from "./types";

export async function getGlobalResources(): Promise<Resources> {
    const [
        cloudtrail,
        s3,
    ] = await Promise.all([
        getCloudTrailResources(),
        getS3Resources(),
    ]);
    
    return {
        ...cloudtrail,
        ...s3,
    };
}