import { ResourceDescription, Scanner, Resources } from "../../types"

export type CreateRegionalScannerFunction = <T extends ResourceDescription>(
    identifier: string,
    fn: (region: string) => Promise<Resources<T>>,
    regions: string[]
) => Scanner<T>

export type CreateGlobalScannerFunction = <T extends ResourceDescription>(
    identifier: string,
    fn: () => Promise<Resources<T>>
) => Scanner<T>