function scannerLogInfo(service: string, content: string, region?: string): void {
    const timestamp = new Date().toISOString();
    const regionInfo = region ? ` in ${region}` : '';
    console.info(`ℹ️ [${timestamp}] [Scanner: ${service}]${regionInfo}: ${content}`);
}

function scannerLogSuccess(service: string, content: string, region?: string): void {
    const timestamp = new Date().toISOString();
    const regionInfo = region ? ` in ${region}` : '';
    console.info(`✅ [${timestamp}] [Scanner: ${service}]${regionInfo}: ${content}`);
}

function scannerLogError(service: string, error: Error, region?: string): void {
    const timestamp = new Date().toISOString();
    const regionInfo = region ? ` in ${region}` : '';
    console.error(`❌ [${timestamp}] [Scanner: ${service}]${regionInfo}: ${error}`);
}

export const scannerLogger = {
    info: scannerLogInfo,
    success: scannerLogSuccess,
    error: scannerLogError,
};
