import { S3Client, ListBucketsCommand, GetBucketLocationCommand, Bucket, GetBucketPolicyCommand, GetBucketVersioningCommand, GetBucketEncryptionCommand, GetBucketTaggingCommand } from "@aws-sdk/client-s3";
import { Credentials, ExtendedBucket, Resources } from "../../../types";
import { buildARN } from "./common/buildArn";
import { getAwsAccountId } from "./common/getAwsAccountId";
import { RateLimiter } from "../../common/RateLimiter";

async function enrichBucketData(client: S3Client, rateLimiter: RateLimiter, bucket: Bucket, accountId: string): Promise<ExtendedBucket> {
  const arn = buildARN({
    accountId,
    region: '', // S3 ARNs don't have a region
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

  const getBucketLocationConstraint = async () => rateLimiter.throttle(() => client.send(new GetBucketLocationCommand({Bucket: bucket.Name}))
    .then(res => res.LocationConstraint || 'us-east-1')
    .catch(() => undefined));

  const [
    bucketPolicy, 
    bucketVersioning, 
    bucketEncryption, 
    bucketTagging,
    bucketLocationConstraint
  ] = await Promise.all([
    getBucketPolicy(),
    getBucketVersioning(),
    getBucketEncryption(),
    getBucketTagging(),
    getBucketLocationConstraint()
  ]);

  return {
    ...bucket,
    ARN: arn,
    LocationConstraint: bucketLocationConstraint,
    Policy: bucketPolicy,
    Versioning: bucketVersioning,
    Encryption: bucketEncryption,
    Tagging: bucketTagging,
  };
}

async function getS3Buckets(
  credentials: Credentials,
  rateLimiter: RateLimiter
): Promise<ExtendedBucket[]> {
  const client = new S3Client([{ credentials }]);

  const accountId = await getAwsAccountId();

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

export async function getS3Resources(
  credentials: Credentials,
  rateLimiter: RateLimiter
): Promise<Resources<ExtendedBucket>> {
  const buckets = await getS3Buckets(
    credentials,
    rateLimiter
  );

  return buckets.reduce((acc, bucket) => {
    acc[bucket.ARN] = bucket;
    return acc;
  }, {} as Resources<ExtendedBucket>);
}