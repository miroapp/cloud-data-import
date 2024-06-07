import { StandardOutputSchema, VisualResourceDescription, VisualizationSchema} from '@/types'
import { transformByConfig } from './transformByConfig'
import {getAwsAccountId} from '../../scanners/scan-functions/aws/common/getAwsAccountId'


export const transformJSONForVisualization = async (input: StandardOutputSchema): Promise<VisualizationSchema> => {

    const account = await getAwsAccountId()
    
    const output: VisualizationSchema = {resources: {}, metadata: {...input.metadata, account}}
    const resourcesToVisualize = input.resources

    for (const arn in resourcesToVisualize) {
        try {
            const result: VisualResourceDescription | null = transformByConfig(arn, resourcesToVisualize[arn])
            if(result) {
                output.resources[arn] = result
            }
        } catch (error) {
            console.log(error)
        }

    }
    return output
    
}