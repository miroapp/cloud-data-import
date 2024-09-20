import {buildCredentialIdentity} from '@/aws-app/utils/buildCredentialIdentity'
import {fromIni} from '@aws-sdk/credential-providers'
import {AwsCredentialIdentity} from '@aws-sdk/types'

jest.mock('@aws-sdk/credential-providers')

describe('buildCredentialIdentity', () => {
	let consoleErrorSpy: jest.SpyInstance

	const mockCredentials: AwsCredentialIdentity = {
		accessKeyId: 'mockAccessKeyId',
		secretAccessKey: 'mockSecretAccessKey',
		sessionToken: 'mockSessionToken',
	}

	beforeEach(() => {
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

		jest.clearAllMocks()
	})

	afterEach(() => {
		jest.restoreAllMocks()
		jest.resetAllMocks()
	})

	it('should returns a valid credential identity', async () => {
		;(fromIni as jest.Mock).mockImplementation(() => async () => mockCredentials)

		const result = await buildCredentialIdentity('dummyProfileValue')

		expect(result).toStrictEqual(mockCredentials)
	})

	it('should throw when an invalid profile is passed in', async () => {
		;(fromIni as jest.Mock).mockImplementation(() => async () => {
			throw new Error(
				'Could not resolve credentials using profile: [dummyProfileValue] in configuration/credentials file(s).',
			)
		})

		await expect(async () => {
			await buildCredentialIdentity('dummyProfileValue')
		}).rejects.toThrowError(
			'Could not resolve credentials using profile: [dummyProfileValue] in configuration/credentials file(s).',
		)

		expect(consoleErrorSpy).toHaveBeenCalledWith('\n[ERROR] Failed to resolve AWS credentials\n')
	})
})
