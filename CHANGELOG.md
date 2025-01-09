# @mirohq/cloud-data-import

## 0.12.4

### Patch Changes

- 283159b: chore(deps): bump the aws-sdk group with 25 updates
- c04e0f2: exported constansts to enable constants usage outside Node.js environments

## 0.12.3

### Patch Changes

- 385b165: - chore(deps): bump the aws-sdk group across 1 directory with 24 updates
  - chore: bumped json schema to 0.1.1
- dad9a19: Included Cloud View's deep-link in outro message

## 0.12.2

### Patch Changes

- e340fd8: Export the AwsServices type
- 35257b0: chore(deps): bump the aws-sdk group across 1 directory with 4 updates
- 19dae1a: chore(deps): bump the aws-sdk group across 1 directory with 24 updates

## 0.12.1

### Patch Changes

- d668d36: chore(deps): bump the aws-sdk packages with 20 updates

## 0.12.0

### Minor Changes

- 8888163: - Separated tags scanning from main resource discovery pipeline
  - Exposed new `getTagsScanner` function from the module
- 0643917: - Decoupled service names to support future feature development
  - Added new AWS scanning capabilities to the module:
    - `getAwsScanner` for single/multiple service scanning
    - `getAllAwsScanners` to retrieve all available scanners
  - Enhanced type safety for scanner implementations
  - Reorganized ECS-related components (clusters, tasks, services) into separate files
  - Added AWS prefix to core types and operations for better clarity

### Patch Changes

- 3e8cace: Fixed the small typing error in boilerplate file
- 47f2108: chore(deps): bump @aws-sdk/client-cloudwatch from 3.654.0 to 3.679.0
- 61ebb32: chore(deps): bump @aws-sdk/client-route-53 from 3.654.0 to 3.679.0
- 45111f5: chore(deps): bump @aws-sdk/client-elasticache from 3.654.0 to 3.679.0
- 9e2e0e9: chore(deps): bump @aws-sdk/client-elastic-load-balancing-v2 from 3.654.0 to 3.679.0
- cf5e43d: chore(deps): bump @aws-sdk/client-eks from 3.654.0 to 3.679.0

## 0.11.1

### Patch Changes

- 67bf143: Tags are now fetched by ARN, significantly speeding up the discovery process

## 0.11.0

### Minor Changes

- a9ae20c: Fix credentials fetching
- 0b1e46c: Add tag support

## 0.10.0

### Minor Changes

- 8b588ef: Updated S3 bucket region configuration

## 0.9.0

### Minor Changes

- b240bf1: - (RateLimiter) Implemented strict throttling instead of windowed throttling
  - (RateLimiter) Added pause, resume, and abort functionality to rate-limiter
  - (RateLimiter) Introduced RetryStrategy concept for customizable retry logic
  - (RateLimiter) Created AWSRateLimitExhaustionRetryStrategy based on RetryStrategy
  - (lib) Integrated new retry strategy in CLI and exposed via library

### Patch Changes

- 9fa6a92: Changed the app name to "Cloud View"
- ca51530: chore(deps): bump @aws-sdk/client-lambda from 3.655.0 to 3.659.0
- 289bfba: chore(deps): bump @aws-sdk/client-dynamodb from 3.654.0 to 3.658.1
- dd02463: fix: rate-limiter import build issue fixed
- e95a19c: chore(deps): bump @aws-sdk/client-rds from 3.654.0 to 3.658.1

## 0.8.0

### Minor Changes

- 01223ed: Add AWS profile parameter support

### Patch Changes

- 7f90266: chore(deps): bump @aws-sdk/client-cloudwatch from 3.621.0 to 3.654.0
- 6d3ba3e: chore(deps): bump @aws-sdk/client-dynamodb from 3.621.0 to 3.654.0
- 3d97fe9: chore(deps): bump @aws-sdk/client-efs from 3.621.0 to 3.654.0
- ffe45a0: Add .npmrc to set registry
- 5e5d6bb: chore(deps): bump @aws-sdk/client-redshift from 3.621.0 to 3.654.0
- fe121c3: chore(deps): bump @aws-sdk/client-sts from 3.624.0 to 3.654.0

## 0.7.0

### Minor Changes

- b31f5be: Exported more functionality including awsRegionsId, experimental_getProcessedData() and more types

## 0.6.1

### Patch Changes

- 7f48aad: fix: container-scaffolding-creation error fixed

## 0.6.0

### Minor Changes

- 0553197: chore: updated visualization data schema (`proccessed` field in the output)
- ddcd8d1: Bumped docVersion to 0.1.0

### Patch Changes

- 5e41b47: Changed processing errors types to non-blockers

## 0.5.0

### Minor Changes

- 2830ed3: chore: update node version from 20 to 18 in package.json

### Patch Changes

- 2df71db: chore(deps): bump @aws-sdk/client-elastic-load-balancing-v2 from 3.621.0 to 3.624.0
- 6c3b8a0: chore(deps): bump @aws-sdk/client-sts from 3.621.0 to 3.624.0
- 53fde69: Exported the scanner types
- f3f1824: chore(deps): bump @aws-sdk/client-route-53 from 3.621.0 to 3.624.0
- dd7c249: chore(deps): bump @aws-sdk/client-lambda from 3.621.0 to 3.624.0
- b052d19: fix: when using the module, ARN's accountId is generated correctly

## 0.4.1

### Patch Changes

- b772caf: - chore(deps): bump `@aws-sdk/client-auto-scaling` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-athena` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-cloudfront` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-cloudtrail` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-cloudwatch` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-dynamodb` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-ec2` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-ecs` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-efs` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-eks` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-elastic-load-balancing` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-elastic-load-balancing-v2` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-elasticache` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-lambda` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-rds` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-redshift` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-route-53` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-s3` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-sns` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-sqs` to `^3.621.0`
  - chore(deps): bump `@aws-sdk/client-sts` to `^3.621.0`
- 4b23e2c: Added types for module

## 0.4.0

### Minor Changes

- 6033467: Added support for Athena Named Queries
- 7915b44: Added support for Network ACLs
- 64f5b9f: Added support for Application Load Balancers
- d0e209d: Added support for Redshift clusters
- 5dc8f7a: Added support for CloudWatch Metric Alarms and Streams
- 2b17717: Exported the scanner and rate-limiter features out, making them available for programmatic use.
- cece9d7: Added support for VPN Gateways

### Patch Changes

- 37ed633: chore(deps): bump @aws-sdk/client-elastic-load-balancing-v2 from 3.600.0 to 3.614.0
- e4d2fd4: chore(deps): bump @aws-sdk/client-cloudfront from 3.600.0 to 3.614.0
- 8f8c7b9: chore(deps): bump @aws-sdk/client-ec2 from 3.609.0 to 3.616.0
- 3f01d1e: chore(deps): bump @aws-sdk/client-eks from 3.609.0 to 3.614.0
- 4961d5b: chore(deps): bump @aws-sdk/client-sns from 3.614.0 to 3.616.0
- bc8728a: chore(deps): bump @aws-sdk/client-s3 from 3.600.0 to 3.614.0
- 3a633cc: chore(deps): bump @aws-sdk/client-auto-scaling from 3.604.0 to 3.616.0
- ffc1760: chore(deps): bump @aws-sdk/client-sns from 3.609.0 to 3.614.0
- feaefa3: chore(deps): bump @aws-sdk/client-sts from 3.609.0 to 3.614.0
- 24cad6c: chore(deps): bump @aws-sdk/client-rds from 3.600.0 to 3.620.0
- 3e46cee: chore(deps): bump @aws-sdk/client-sqs from 3.600.0 to 3.614.0
- 1488e2e: chore(deps): bump @aws-sdk/client-elasticache from 3.600.0 to 3.616.0
- b089fbe: chore(deps): bump @aws-sdk/client-lambda from 3.600.0 to 3.614.0

## 0.3.3

### Patch Changes

- fd3aaed: fix: build step added to the publish workflow

## 0.3.0

### Minor Changes

- 6d78791: Added support for ELBv2 Target Groups

### Patch Changes

- 20d3c31: chore(deps): bump @aws-sdk/client-ecs from 3.600.0 to 3.614.0
- 520d496: chore(deps): bump @aws-sdk/client-efs from 3.600.0 to 3.614.0
- f0569a3: chore(deps): bump @aws-sdk/client-dynamodb from 3.602.0 to 3.614.0

## 0.2.1

### Patch Changes

- 70b0d70: chore(deps): bump @aws-sdk/client-ec2 from 3.604.0 to 3.609.0
- 3ed43d3: chore(deps): bump @aws-sdk/client-sns from 3.600.0 to 3.609.0
- 1813d20: chore(deps): bump @aws-sdk/client-elastic-load-balancing from 3.600.0 to 3.609.0
- b285db2: - Added CONTRIBUTING.md
  - Readme improvements
- 156475e: chore(deps): bump @aws-sdk/client-eks from 3.605.0 to 3.609.0

## 0.2.0

### Minor Changes

- ab971ee: - Added `processed` field to the schema for future compatibility

### Patch Changes

- 67737d7: chore(deps): bump @aws-sdk/client-sts from 3.600.0 to 3.606.0
- 7db58b0: chore(deps): bump @aws-sdk/client-eks from 3.600.0 to 3.605.0

## 0.1.0

### Minor Changes

- acf07cc: First package version bump test with changesets
