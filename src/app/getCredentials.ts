import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { Config, Credentials } from "../types";

export const NO_ASSUME_ROLE_ERROR = "NO_ASSUMED_ROLE_ERROR";

export async function getCredentials(_: Config): Promise<Credentials> {
    const client = new STSClient({});

    try {
        // Check if a role is already assumed in the terminal session
        const command = new GetCallerIdentityCommand({});
        const response = await client.send(command);

        if (response.Arn) {
            return {};
        } else {
            throw new Error(NO_ASSUME_ROLE_ERROR);
        }
    } catch (error) {
        throw new Error(NO_ASSUME_ROLE_ERROR);
    }
}
