import {scanAndSaveAsJson} from './app/scan-and-save-as-json'

async function main() {
	await scanAndSaveAsJson()
}

main().catch((error) => {
	console.error(error)
	process.exit(1)
})
