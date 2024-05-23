import { Resources, ScannerLifecycleHook } from "../../types";

export class Logger implements ScannerLifecycleHook {
    getLegend(service: string, region?: string): string {
        const timestamp = new Date().toISOString();
        const regionInfo = region ? ` in ${region}` : '';
        return `[${timestamp}] [${service}${regionInfo}]`;
    }

    onStart(service: string, region?: string): void {
        console.info(`🆕 ${this.getLegend(service, region)}: scanning...`);
    }
    
    onComplete(resources: Resources, service: string, region?: string): void {
        console.info(`✅ ${this.getLegend(service, region)}: discovered ${Object.keys(resources).length} resources.`);
    }
    
    onError(error: Error, service: string, region?: string): void {
        console.error(`❌ ${this.getLegend(service, region)}: ${error.message}`);
    }
}
