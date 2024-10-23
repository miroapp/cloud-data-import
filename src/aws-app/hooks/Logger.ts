import Spinnies from 'spinnies'
import {AwsResources, AwsScannerLifecycleHook} from '@/types'

export class Logger implements AwsScannerLifecycleHook {
	private spinnies = new Spinnies()

	getLegend(service: string, region?: string): string {
		const timestamp = new Date().toISOString()
		const regionInfo = region ? ` in ${region}` : ''
		return `[${timestamp}] [${service}${regionInfo}]`
	}

	getSpinnerKey(service: string, region?: string): string {
		return `${service}-${region || 'default'}`
	}

	onStart(service: string, region?: string): void {
		const spinnerKey = this.getSpinnerKey(service, region)
		const legend = this.getLegend(service, region)
		this.spinnies.add(spinnerKey, {text: `${legend}: scanning...`})
	}

	onComplete(resources: AwsResources, service: string, region?: string): void {
		const spinnerKey = this.getSpinnerKey(service, region)
		const legend = this.getLegend(service, region)
		this.spinnies.succeed(spinnerKey, {text: `${legend}: discovered ${Object.keys(resources).length} resources.`})
	}

	onError(error: Error, service: string, region?: string): void {
		const spinnerKey = this.getSpinnerKey(service, region)
		const legend = this.getLegend(service, region)
		this.spinnies.fail(spinnerKey, {text: `${legend}: ${error.message}`})
	}
}
