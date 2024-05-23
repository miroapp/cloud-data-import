import { Logger } from "./hooks/Logger";
import { getAwsScanners } from "../scanners"
import { StandardOutputSchema, ScannerError, Config, Credentials } from "../types"
import { saveAsJson } from "./utils/saveAsJson"

export const scanAndSaveAsJson = async (config: Config) => {
    // prepare scanners
    const credentials: Credentials = {} // role is already assumed in the terminal session
    const shouldIncludeGlobalServices = !config['regional-only'];
    const scanners = getAwsScanners(credentials, config.regions, shouldIncludeGlobalServices, [
        new Logger(), // log scanning progress
    ]);

    // run scanners
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

    saveAsJson(config.output, output, config.compressed)
}