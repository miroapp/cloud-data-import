import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

export const getAccountId = (() => {
    let accountId: string | undefined;
    return async (): Promise<string> => {
        if (!accountId) {
            const stsClient = new STSClient({});
            const command = new GetCallerIdentityCommand({});
            const response = await stsClient.send(command);
            accountId = response.Account!;
        }
        return accountId;
    };
})();
