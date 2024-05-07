import { S3Client, ListBucketsCommand, Bucket } from "@aws-sdk/client-s3";
import { Resources } from "../types";

// @todo add more details to the bucket object
async function getS3Buckets(): Promise<Bucket[]> {
  const client = new S3Client({});

  const listBucketsCommand = new ListBucketsCommand({});
  const listBucketsResponse = await client.send(listBucketsCommand);

  return listBucketsResponse.Buckets || [];
}

export async function getS3Resources(): Promise<Resources<Bucket>> {
  const buckets = await getS3Buckets();

  return buckets.reduce((acc, bucket) => {
    if (!bucket.Name) {
      throw new Error('Bucket Name is missing in the response');
    }

    acc[bucket.Name] = bucket;
    return acc;
  }, {} as Resources<Bucket>);
}
