import {getDefaultConfigValues} from '@/aws-app/config/getConfigViaGui'
import {getDefaultOutputName} from '@/aws-app/config/getDefaultOutputName'

jest.mock('@/aws-app/config/getDefaultOutputName')

describe('getConfigViaGui', () => {
	const defaultConfigResponse = {
		output: 'dummyOutputName',
		regions: undefined,
		profile: 'default',
		regionalOnly: false,
		callRate: 10,
		compressed: false,
	}

	const originalEnv = process.env

	beforeEach(() => {
		;(getDefaultOutputName as jest.Mock).mockReturnValue('dummyOutputName')

		jest.clearAllMocks()

		process.env = {
			...originalEnv,
		}
	})

	afterEach(() => {
		jest.restoreAllMocks()
		jest.resetAllMocks()
	})

	it('should return correct default values', async () => {
		const defaultConfig = await getDefaultConfigValues()

		expect(defaultConfig).toStrictEqual(defaultConfigResponse)
	})

	it('should return correct prioritize the CLOUDVIEW_AWS_PROFILE environment variable over the AWS_PROFILE environment variable', async () => {
		process.env.CLOUDVIEW_AWS_PROFILE = 'dummyCloudviewAwsProfileEnvVar'
		process.env.AWS_PROFILE = 'dummyAwsProfileEnvVar'

		const defaultConfig = await getDefaultConfigValues()

		expect(defaultConfig).toStrictEqual({
			...defaultConfigResponse,
			profile: 'dummyCloudviewAwsProfileEnvVar',
		})
	})

	it('should fall back to the AWS_PROFILE environment variable when CLOUDVIEW_AWS_PROFILE is not configured', async () => {
		process.env.AWS_PROFILE = 'dummyAwsProfileEnvVar'

		const defaultConfig = await getDefaultConfigValues()

		expect(defaultConfig).toStrictEqual({
			...defaultConfigResponse,
			profile: 'dummyAwsProfileEnvVar',
		})
	})
})
