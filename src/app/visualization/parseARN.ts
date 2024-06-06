

// ARN is a special string which can describe a resouce according the rules given here:
// https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html



export type ARNData  = {
    partition: string;
    service: string;
    region?: string;
    accountID?: string;
    resourceID?: string;
    resourceType?: string;
}

export const parseARN = (arn: string) => {
    const regex = new RegExp(/^arn:(?<Partition>[^:\n]*):(?<Service>[^:\n]*):(?<Region>[^:\n]*):(?<AccountID>[^:\n]*):(?<Ignore>(?:[^\/\n]*\/[^\/\n]*)?(?<ResourceType>[^:\/\n]*)[:\/])?(?<ResourceID>.*)$/, 'gi')

    const matches = arn.matchAll(regex)

    if (matches) {
        const matchedResult = Array.from(matches)[0]
        const parsedGroups = matchedResult.groups

        if(parsedGroups) {
            const result: ARNData = {
                partition: parsedGroups.Partition,
                service: parsedGroups.Service,
                region: parsedGroups.Region,
                accountID: parsedGroups.AccountID,
                resourceID: parsedGroups.ResourceID,
                resourceType: parsedGroups.ResourceType
            }
            return result
        } else {
            return null
        }

    }
    return null
}
