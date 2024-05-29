import {promises} from 'fs'

export function saveAsJson(fileName: string, data: object, compressed: boolean = false) {
	return promises.writeFile(fileName, JSON.stringify(data, null, compressed ? 0 : 2))
}
