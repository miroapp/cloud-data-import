import {exec} from 'child_process'
import {dirname, basename} from 'path'
import {platform} from 'os'

const osName = platform()

export async function openDirectoryAndFocusFile(filePath: string) {
	const folderPath = dirname(filePath)
	const fileName = basename(filePath)

	let command: string

	switch (osName) {
		case 'win32':
			command = `explorer /select,"${filePath}"`
			break
		case 'darwin':
			command = `open -R "${filePath}"`
			break
		case 'linux':
			command = `nautilus --browser "${folderPath}" && xdotool search --name "${fileName}" windowactivate key --clearmodifiers space`
			break
		default:
			return
	}

	return new Promise<void>((resolve, reject) => {
		exec(command, (error) => {
			if (error) {
				reject(error)
			} else {
				resolve()
			}
		})
	})
}
