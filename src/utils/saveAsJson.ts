import { promises } from "fs"

export function saveAsJson(fileName: string, data: object) {
    return promises.writeFile(fileName, JSON.stringify(data, null, 2))
}