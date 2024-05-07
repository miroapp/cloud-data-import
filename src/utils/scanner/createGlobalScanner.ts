import { CreateGlobalScannerFunction } from "./types";

export const createGlobalScanner: CreateGlobalScannerFunction = (identifier, fn) => {
    return async () => {
        const resources = {};

        return { resources, errors: [] };
    };
}
