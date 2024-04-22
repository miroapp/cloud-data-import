import { S3Client, ListBucketsCommand, Bucket } from "@aws-sdk/client-s3";
import { S3Schema } from "../types";

async function getS3Buckets(): Promise<Bucket[]> {
  const client = new S3Client({});

  const listBucketsCommand = new ListBucketsCommand({});
  const listBucketsResponse = await client.send(listBucketsCommand);

  return listBucketsResponse.Buckets || [];
}

export async function getS3Resources(): Promise<S3Schema> {
  return {
    buckets: await getS3Buckets(),
  };
}
