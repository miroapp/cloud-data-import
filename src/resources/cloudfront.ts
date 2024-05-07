import { 
    CloudFrontClient,
    ListDistributionsCommand,
    GetDistributionConfigCommand,
    ListTagsForResourceCommand,
} from "@aws-sdk/client-cloudfront";
import { ExtendedCloudFrontDistribution, Resources } from "../types";

async function getCloudFrontDistributions(): Promise<ExtendedCloudFrontDistribution[]> {
    const client = new CloudFrontClient({});

    const command = new ListDistributionsCommand({});
    const response = await client.send(command);

    const enrichedDistributions = await Promise.all(
        (response.DistributionList?.Items || []).map(async (distribution) => {
            const [
                distributionConfig,
                tags
            ] = await Promise.all([
                client.send(new GetDistributionConfigCommand({ Id: distribution.Id }))
                    .then(res => res.DistributionConfig)
                    .catch(() => undefined),
                client.send(new ListTagsForResourceCommand({ Resource: distribution.ARN }))
                    .then(res => res.Tags)
                    .catch(() => undefined)
            ]);

            return {
                ...distribution,
                DistributionConfig: distributionConfig,
                Tags: tags
            };
        })
    );

    return enrichedDistributions;
}

export async function getCloudFrontResources(): Promise<Resources<ExtendedCloudFrontDistribution>> {
    const distributions = await getCloudFrontDistributions();

    return distributions.reduce((acc, distribution) => {
        if (!distribution.ARN) throw new Error('Distribution ARN is missing in the response');

        acc[distribution.ARN] = distribution;
        return acc;
    }, {} as Resources<ExtendedCloudFrontDistribution>);
}
