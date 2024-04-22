import { RDSSchema } from "../types";

export async function getRDSResources(): Promise<RDSSchema> {
    return {
        instances: [],
        clusters: []
    }
}