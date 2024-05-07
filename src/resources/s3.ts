import { S3Client, ListBucketsCommand, GetBucketLocationCommand, Bucket, ServerSideEncryptionConfiguration, Tag, GetBucketPolicyCommand, GetBucketVersioningCommand, GetBucketEncryptionCommand, GetBucketTaggingCommand } from "@aws-sdk/client-s3";
import { ExtendedBucket, Resources } from "../types";
import { buildARN } from "../utils/buildARN";
import { getAccountId } from "../utils/getAccountId";

async function getBucketLocation(client: S3Client, bucketName: string): Promise<string> {
  const command = new GetBucketLocationCommand({ Bucket: bucketName });
  const response = await client.send(command);

  // Quote from https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLocation.html#API_GetBucketLocation_ResponseSyntax:
  // "... Buckets in Region us-east-1 have a LocationConstraint of null."
  return response.LocationConstraint || 'us-east-1';
}

async function enrichBucketData(client: S3Client, bucket: Bucket, accountId: string): Promise<ExtendedBucket> {
  const region = await getBucketLocation(client, bucket.Name!);
  
  const arn = buildARN({
    accountId,
    region,
    service: 's3',
    resource: `bucket/${bucket.Name}`,
  });

  const [
    bucketPolicy, 
    bucketVersioning, 
    bucketEncryption, 
    bucketTagging
  ] = await Promise.all([
    client.send(new GetBucketPolicyCommand({Bucket: bucket.Name})).catch(() => undefined),
    client.send(new GetBucketVersioningCommand({Bucket: bucket.Name})).catch(() => undefined),
    client.send(new GetBucketEncryptionCommand({Bucket: bucket.Name})).catch(() => undefined),
    client.send(new GetBucketTaggingCommand({Bucket: bucket.Name})).catch(() => undefined)
  ]);

  return {
    ...bucket,
    LocationConstraint: region,
    ARN: arn,
    Policy: bucketPolicy?.Policy && JSON.parse(bucketPolicy?.Policy),
    Versioning: bucketVersioning?.Status,
    Encryption: bucketEncryption?.ServerSideEncryptionConfiguration,
    Tagging: bucketTagging?.TagSet
  };
}

async function getS3Buckets(): Promise<ExtendedBucket[]> {
  const client = new S3Client({});
  const accountId = await getAccountId();

  try {
    const listBucketsCommand = new ListBucketsCommand({});
    const listBucketsResponse = await client.send(listBucketsCommand);

    const enrichedBuckets = await Promise.all(
      (listBucketsResponse.Buckets || []).map(bucket => {
        if (!bucket.Name) throw new Error('Bucket Name is missing in the response');
        return enrichBucketData(client, bucket, accountId);
      })
    );

    return enrichedBuckets;
  } catch (error) {
    console.error('Error while fetching S3 buckets:', error);
    throw error;
  }
}

export async function getS3Resources(): Promise<Resources<ExtendedBucket>> {
  const buckets = await getS3Buckets();

  return buckets.reduce((acc, bucket) => {
    acc[bucket.ARN] = bucket;
    return acc;
  }, {} as Resources<ExtendedBucket>);
}