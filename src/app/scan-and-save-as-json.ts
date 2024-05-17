import { StandardOutputSchema, Scanner, ScannerError } from "../types"
import { saveAsJson } from "../utils/saveAsJson"

export const scanAndSaveAsJson = async (scanners: Scanner[], path: string, compressed: boolean) => {
    const startedAt = new Date().toISOString()
    const result = await Promise.all(scanners.map(scanner => scanner()))
    const finishedAt = new Date().toISOString()

    // aggregate resources
    const resources = result.reduce((acc, { resources }) => {
        return { ...acc, ...resources }
    }, {})

    // aggregate errors
    const errors = result.reduce((acc, { errors }) => {
        return [...acc, ...errors]
    }, [] as ScannerError[])

    // create output
    const output: StandardOutputSchema = {
        provider: 'aws',
        docVersion: '0.0.1',
        resources,
        errors,
        metadata: {
          startedAt,
          finishedAt,
        },
    }

    saveAsJson(path, output, compressed)
}