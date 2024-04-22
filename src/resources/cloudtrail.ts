import { CloudTrailSchema } from "../types";

export async function getCloudTrailResources(): Promise<CloudTrailSchema> {
    return {
        trails: [],
    }
}