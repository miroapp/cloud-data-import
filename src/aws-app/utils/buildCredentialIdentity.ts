import {AwsCredentialIdentity} from '@aws-sdk/types'
import {fromIni} from '@aws-sdk/credential-providers'

/**
 * Builds the AwsCredentialIdentity
 *
 * it is important to note that if there is more than one credential source available to the SDK, a default precedence of selection will be followed.
 * see: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html
 */
export const buildCredentialIdentity = async (profile: string): Promise<AwsCredentialIdentity> => {
	const credentialsProvider = fromIni({
		profile: profile,
	})

	let credentialIdentity: AwsCredentialIdentity
	try {
		credentialIdentity = await credentialsProvider()
	} catch (error) {
		console.error(`\n[ERROR] Failed to resolve AWS credentials\n`)
		throw error
	}

	return credentialIdentity
}
