import {promises as fs} from 'fs'
import {saveAsJson} from '@/aws-app/utils/saveAsJson'

jest.mock('fs', () => ({
	promises: {
		writeFile: jest.fn(),
	},
}))

describe('saveAsJson', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	it('should save the file with .cloud.json extension if no extension is provided', async () => {
		const fileName = 'testfile'
		const data = {key: 'value'}
		const compressed = false

		await saveAsJson(fileName, data, compressed)

		expect(fs.writeFile).toHaveBeenCalledWith('testfile.cloud.json', expect.any(String))
	})

	it('should save the file with the provided extension', async () => {
		const fileName = 'testfile.json'
		const data = {key: 'value'}
		const compressed = false

		await saveAsJson(fileName, data, compressed)

		expect(fs.writeFile).toHaveBeenCalledWith('testfile.json', expect.any(String))
	})

	it('should save the file with compressed format if compressed is true', async () => {
		const fileName = 'testfile'
		const data = {key: 'value'}
		const compressed = true

		await saveAsJson(fileName, data, compressed)

		expect(fs.writeFile).toHaveBeenCalledWith('testfile.cloud.json', JSON.stringify(data, null, 0))
	})

	it('should save the file with pretty format if compressed is false', async () => {
		const fileName = 'testfile'
		const data = {key: 'value'}
		const compressed = false

		await saveAsJson(fileName, data, compressed)

		expect(fs.writeFile).toHaveBeenCalledWith('testfile.cloud.json', JSON.stringify(data, null, 2))
	})

	it('should save the file with provided data as string when compressed is true', async () => {
		const fileName = 'testfile'
		const data = {key: 'value', key2: {key3: 'value3'}}
		const compressed = false

		await saveAsJson(fileName, data, compressed)

		const fileContent = (fs.writeFile as jest.Mock).mock.calls[0][1]

		expect(JSON.parse(fileContent)).toEqual(data)
	})

	it('should save the file with provided data as string when compressed is false', async () => {
		const fileName = 'testfile'
		const data = {key: 'value', key2: {key3: 'value3'}}
		const compressed = true

		await saveAsJson(fileName, data, compressed)

		const fileContent = (fs.writeFile as jest.Mock).mock.calls[0][1]

		expect(JSON.parse(fileContent)).toEqual(data)
	})
})
