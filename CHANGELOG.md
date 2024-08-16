# @mirohq/cloud-data-import

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
