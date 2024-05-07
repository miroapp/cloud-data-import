export function scannerLogInfo(service: string, content: string, region?: string): void {
    const timestamp = new Date().toISOString();
    const regionInfo = region ? ` in ${region}` : '';
    console.info(`ℹ️ [${timestamp}] [Scanner: ${service}]${regionInfo}: ${content}`);
}

export function scannerLogSuccess(service: string, content: string, region?: string): void {
    const timestamp = new Date().toISOString();
    const regionInfo = region ? ` in ${region}` : '';
    console.info(`✅ [${timestamp}] [Scanner: ${service}]${regionInfo}: ${content}`);
}

export function scannerLogError(service: string, error: Error, region?: string): void {
    const timestamp = new Date().toISOString();
    const regionInfo = region ? ` in ${region}` : '';
    console.error(`❌ [${timestamp}] [Scanner: ${service}]${regionInfo}: ${error}`);
}