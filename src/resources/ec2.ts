import { EC2Schema } from "../types";

export async function getEC2Resources(): Promise<EC2Schema> {
    return {
        instances: []
    }
}