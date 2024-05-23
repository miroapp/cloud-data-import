import { ARN, build } from '@aws-sdk/util-arn-parser'

type BuildOptions = Omit<ARN, "partition"> & { partition?: string };

export const buildARN = (arn: BuildOptions): string => build(arn);
