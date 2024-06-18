import {promises} from 'fs'
import {extname} from 'path'

export function saveAsJson(fileName: string, data: object, compressed: boolean = false) {
	// If no extension is provided, add .json, otherwise, use the provided extension
	if (extname(fileName) === '') {
		fileName += '.json'
	}

	return promises.writeFile(fileName, JSON.stringify(data, null, compressed ? 0 : 2))
}
