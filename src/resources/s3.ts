import { S3Client, ListBucketsCommand, GetBucketLocationCommand, Bucket, ServerSideEncryptionConfiguration, Tag, GetBucketPolicyCommand, GetBucketVersioningCommand, GetBucketEncryptionCommand, GetBucketTaggingCommand } from "@aws-sdk/client-s3";
import { ExtendedBucket, Resources } from "../types";
import { buildARN } from "../utils/buildArn";
import { getAccountId } from "../utils/getAccountId";
import { RateLimiter } from "../utils/RateLimiter";

async function getBucketLocation(client: S3Client, rateLimiter: RateLimiter, bucketName: string): Promise<string> {
  const command = new GetBucketLocationCommand({ Bucket: bucketName });
  const response = await rateLimiter.throttle(() => client.send(command));

  // Quote from https://docs.aws.amazon.com/AmazonS3/latest/API/API_GetBucketLocation.html#API_GetBucketLocation_ResponseSyntax:
  // "... Buckets in Region us-east-1 have a LocationConstraint of null."
  return response.LocationConstraint || 'us-east-1';
}

async function enrichBucketData(client: S3Client, rateLimiter: RateLimiter, bucket: Bucket, accountId: string): Promise<ExtendedBucket> {
  const region = await getBucketLocation(client, rateLimiter, bucket.Name!);
  
  const arn = buildARN({
    accountId,
    region,
    service: 's3',
    resource: `bucket/${bucket.Name}`,
  });

  const getBucketPolicy = async () => await rateLimiter.throttle(() => client.send(new GetBucketPolicyCommand({Bucket: bucket.Name}))
    .then(res => res.Policy && JSON.parse(res.Policy))
    .catch(() => undefined));

  const getBucketVersioning = async () => rateLimiter.throttle(() => client.send(new GetBucketVersioningCommand({Bucket: bucket.Name}))
    .then(res => res.Status)
    .catch(() => undefined));

  const getBucketEncryption = async () => rateLimiter.throttle(() => client.send(new GetBucketEncryptionCommand({Bucket: bucket.Name}))
    .then(res => res.ServerSideEncryptionConfiguration)
    .catch(() => undefined));

  const getBucketTagging = async () => rateLimiter.throttle(() => client.send(new GetBucketTaggingCommand({Bucket: bucket.Name}))
    .then(res => res.TagSet)
    .catch(() => undefined));

  const [
    bucketPolicy, 
    bucketVersioning, 
    bucketEncryption, 
    bucketTagging
  ] = await Promise.all([
    getBucketPolicy(),
    getBucketVersioning(),
    getBucketEncryption(),
    getBucketTagging()
  ]);

  return {
    ...bucket,
    LocationConstraint: region,
    ARN: arn,
    Policy: bucketPolicy,
    Versioning: bucketVersioning,
    Encryption: bucketEncryption,
    Tagging: bucketTagging,
  };
}

async function getS3Buckets(): Promise<ExtendedBucket[]> {
  const client = new S3Client({});
  const rateLimiter = new RateLimiter(10, 1000);

  const accountId = await getAccountId();

  try {
    const listBucketsCommand = new ListBucketsCommand({});
    const listBucketsResponse = await rateLimiter.throttle(() => client.send(listBucketsCommand));

    const enrichedBuckets = await Promise.all(
      (listBucketsResponse.Buckets || []).map(bucket => {
        if (!bucket.Name) throw new Error('Bucket Name is missing in the response');
        return enrichBucketData(client, rateLimiter, bucket, accountId);
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