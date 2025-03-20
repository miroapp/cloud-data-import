import Spinnies from 'spinnies'
import {AwsResourcesList, AwsScannerLifecycleHook} from '@/types'
import {AwsSupportedManagementServices, AwsSupportedResources} from '@/definitions/supported-services'

export class Logger implements AwsScannerLifecycleHook<AwsSupportedResources | AwsSupportedManagementServices> {
	private spinnies = new Spinnies()

	getLegend(service: AwsSupportedResources | AwsSupportedManagementServices, region?: string): string {
		const timestamp = new Date().toISOString()
		const regionInfo = region ? ` in ${region}` : ''
		return `[${timestamp}] [${service}${regionInfo}]`
	}

	getSpinnerKey(service: AwsSupportedResources | AwsSupportedManagementServices, region?: string): string {
		return `${service}-${region || 'default'}`
	}

	onStart(service: AwsSupportedResources | AwsSupportedManagementServices, region?: string): void {
		const spinnerKey = this.getSpinnerKey(service, region)
		const legend = this.getLegend(service, region)
		this.spinnies.add(spinnerKey, {text: `${legend}: scanning...`})
	}

	onComplete(
		resources: AwsResourcesList,
		service: AwsSupportedResources | AwsSupportedManagementServices,
		region?: string,
	): void {
		const spinnerKey = this.getSpinnerKey(service, region)
		const legend = this.getLegend(service, region)
		this.spinnies.succeed(spinnerKey, {text: `${legend}: discovered ${Object.keys(resources).length} resources.`})
	}

	onError(error: Error, service: AwsSupportedResources | AwsSupportedManagementServices, region?: string): void {
		const spinnerKey = this.getSpinnerKey(service, region)
		const legend = this.getLegend(service, region)
		this.spinnies.fail(spinnerKey, {text: `${legend}: ${error.message}`})
	}
}
