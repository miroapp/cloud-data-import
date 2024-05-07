import { CreateRegionalScannerFunction } from "./types";

export const createRegionalScanner: CreateRegionalScannerFunction = (identifier, fn, regions) => {
    return async () => {
        const resources = {};

        return { resources, errors: [] };
    };
}
