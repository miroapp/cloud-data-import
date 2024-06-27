import path from 'path'
import {Logger} from '@/aws-app/hooks/Logger'
import {getAwsScanners} from '@/scanners'
import {ProcessedData, Resources, StandardOutputSchema} from '@/types'
import {saveAsJson} from '@/aws-app/utils/saveAsJson'
import * as cliMessages from '@/aws-app/cliMessages'
import {openDirectoryAndFocusFile} from '@/aws-app/utils/openDirectoryAndFocusFile'
import {getProcessedData} from '@/aws-app/process/getProcessedData'
import {getConfig} from '@/aws-app/config'
import {createRateLimiterFactory} from '@/aws-app/utils/createRateLimiterFactory'
import {getAwsAccountId} from '@/scanners/scan-functions/aws/common/getAwsAccountId'

import {mockDate} from '../mocks/dateMock'

jest.mock('@/aws-app/hooks/Logger')
jest.mock('@/scanners')
jest.mock('@/aws-app/utils/saveAsJson')
jest.mock('@/aws-app/cliMessages')
jest.mock('@/aws-app/utils/openDirectoryAndFocusFile')
jest.mock('@/aws-app/process/getProcessedData')
jest.mock('@/aws-app/config')
jest.mock('@/aws-app/utils/createRateLimiterFactory')
jest.mock('@/scanners/scan-functions/aws/common/getAwsAccountId')

describe('main function', () => {
	let consoleLogSpy: jest.SpyInstance
	let consoleErrorSpy: jest.SpyInstance
	let getIntroSpy: jest.SpyInstance
	let getOutroSpy: jest.SpyInstance
	let mockScanners: jest.Mock[]
	let config: any
	let mockedDate: ReturnType<typeof mockDate>

	beforeEach(() => {
		consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
		consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
		getIntroSpy = jest.spyOn(cliMessages, 'getIntro').mockReturnValue('Intro message')
		getOutroSpy = jest.spyOn(cliMessages, 'getOutro').mockReturnValue('Outro message')

		mockedDate = mockDate(15000) // 15 seconds between Date.now() calls

		config = {
			regions: ['us-east-1', 'eu-west-1'],
			output: 'output.json',
			compressed: false,
			raw: true,
			'regional-only': false,
			'open-output-dir': true,
		}
		;(getConfig as jest.Mock).mockResolvedValue(config)
		;(createRateLimiterFactory as jest.Mock).mockReturnValue(jest.fn())
		;(getAwsAccountId as jest.Mock).mockResolvedValue('123456789012')
		;(getProcessedData as jest.Mock).mockResolvedValue({
			resources: {
				'dummy:arn:1': 'dummy:info',
				'dummy:arn:2': 'dummy:info',
			},
		})

		mockScanners = [
			jest.fn().mockResolvedValue({
				resources: {
					'dummy:arn:1': 'dummy:raw:info',
					'dummy:arn:2': 'dummy:raw:info',
				},
				errors: [],
			}),
		]
		;(getAwsScanners as jest.Mock).mockReturnValue(mockScanners)

		jest.clearAllMocks()
	})

	afterEach(() => {
		mockedDate.restore()
		mockedDate.reset()
		jest.restoreAllMocks()
		jest.resetAllMocks()
	})

	it('should log the intro message', async () => {
		const main = (await import('@/aws-app/main')).default
		await main()
		expect(consoleLogSpy).toHaveBeenCalledWith('Intro message')
	})

	it('should set AWS_REGION environment variable', async () => {
		const main = (await import('@/aws-app/main')).default
		await main()
		expect(process.env.AWS_REGION).toBe('us-east-1')
	})

	it('should call getAwsScanners with correct parameters', async () => {
		const main = (await import('@/aws-app/main')).default
		await main()
		expect(getAwsScanners).toHaveBeenCalledWith({
			credentials: undefined,
			regions: config.regions,
			getRateLimiter: expect.any(Function),
			shouldIncludeGlobalServices: true,
			hooks: [expect.any(Logger)],
		})
	})

	it('should aggregate resources and errors correctly', async () => {
		const main = (await import('@/aws-app/main')).default

		await main()

		const dateCallsBeforeMeasure = 4 // @todo implement a more robust way to mock Date

		const expectedStartedAt = mockedDate.getExpectedTimeISOString(dateCallsBeforeMeasure) // first Date.now() call
		const expectedFinishedAt = mockedDate.getExpectedTimeISOString(dateCallsBeforeMeasure + 1) // second Date.now() call

		const expectedOutput: StandardOutputSchema = {
			provider: 'aws',
			docVersion: '0.0.1',
			resources: {
				'dummy:arn:1': 'dummy:raw:info',
				'dummy:arn:2': 'dummy:raw:info',
			} as unknown as Resources,
			processed: {
				resources: {
					'dummy:arn:1': 'dummy:info',
					'dummy:arn:2': 'dummy:info',
				},
			} as unknown as ProcessedData,
			errors: [],
			metadata: {
				account: '123456789012',
				regions: config.regions,
				startedAt: expectedStartedAt,
				finishedAt: expectedFinishedAt,
			},
		}

		expect(saveAsJson).toHaveBeenCalledWith(
			path.resolve(process.cwd(), config.output),
			expectedOutput,
			config.compressed,
		)
	})

	it('should log an error if saving output fails', async () => {
		;(saveAsJson as jest.Mock).mockRejectedValue(new Error('Save error'))
		const main = (await import('@/aws-app/main')).default
		await expect(main()).rejects.toThrow('Save error')
		expect(consoleErrorSpy).toHaveBeenCalledWith('\n[ERROR] Failed to save output to output.json\n')
	})

	it('should open output directory if configured', async () => {
		const main = (await import('@/aws-app/main')).default
		await main()
		expect(openDirectoryAndFocusFile).toHaveBeenCalledWith(path.resolve(process.cwd(), config.output))
	})

	it('should log the outro message with correct parameters', async () => {
		const main = (await import('@/aws-app/main')).default
		await main()
		expect(getOutroSpy).toHaveBeenCalledWith({
			pathname: path.resolve(process.cwd(), config.output),
			duration: 15, // mocked 15 seconds between startedAt and finishedAt
			count: 2, // Two resources
		})
		expect(consoleLogSpy).toHaveBeenCalledWith('Outro message')
	})
})
