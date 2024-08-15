import {getProcessingErrorMessage} from '@/aws-app/cliMessages'
import {ErrorManager} from '../types'

export class ProcessingErrorManager implements ErrorManager {
	errors: Record<string, string[]> = {}

	log(arn: string, message: string) {
		if (!this.errors[arn]) {
			this.errors[arn] = []
		}
		this.errors[arn].push(message)
	}

	render() {
		if (Object.keys(this.errors).length > 0) {
			const message = getProcessingErrorMessage(this.errors)
			console.log(message)
		}
	}
}
