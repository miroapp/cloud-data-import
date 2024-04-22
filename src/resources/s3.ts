import { S3Schema } from "../types";

export async function getS3Resources(): Promise<S3Schema> {
    return {
        buckets: [],
    }
}