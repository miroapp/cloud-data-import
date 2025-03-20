import Spinnies from 'spinnies'
import {AwsResourcesList, AwsScannerLifecycleHook} from '@/types'
import {
	type AllSupportedAwsServices,
	awsManagementServiceNames,
	awsResourceNames,
	AwsSupportedResources,
} from '@/definitions/supported-services'

export class Logger implements AwsScannerLifecycleHook<AllSupportedAwsServices> {
	private spinnies = new Spinnies()

	getLegend(service: AllSupportedAwsServices, region?: string): string {
		const isAwsResource = (svc: AllSupportedAwsServices): svc is AwsSupportedResources => svc in AwsSupportedResources

		const serviceName = isAwsResource(service) ? awsResourceNames[service] : awsManagementServiceNames[service]

		const timestamp = new Date().toISOString()
		const regionInfo = region ? ` in ${region}` : ''
		return `[${timestamp}] [${serviceName}${regionInfo}]`
	}

	getSpinnerKey(service: AllSupportedAwsServices, region?: string): string {
		return `${service}-${region || 'default'}`
	}

	onStart(service: AllSupportedAwsServices, region?: string): void {
		const spinnerKey = this.getSpinnerKey(service, region)
		const legend = this.getLegend(service, region)
		this.spinnies.add(spinnerKey, {text: `${legend}: scanning...`})
	}

	onComplete(resources: AwsResourcesList, service: AllSupportedAwsServices, region?: string): void {
		const spinnerKey = this.getSpinnerKey(service, region)
		const legend = this.getLegend(service, region)
		this.spinnies.succeed(spinnerKey, {text: `${legend}: discovered ${Object.keys(resources).length} resources.`})
	}

	onError(error: Error, service: AllSupportedAwsServices, region?: string): void {
		const spinnerKey = this.getSpinnerKey(service, region)
		const legend = this.getLegend(service, region)
		this.spinnies.fail(spinnerKey, {text: `${legend}: ${error.message}`})
	}
}
