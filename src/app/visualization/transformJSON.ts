import { StandardOutputSchema, VisualResourceDescription, VisualizationSchema} from '@/types'
import { transformByConfig } from './transformByConfig'


export const transformJSONForVisualization = (input: StandardOutputSchema): VisualizationSchema => {
    
    const output: VisualizationSchema = {resources: {}, metadata: input.metadata}
    const resourcesToVisualize = input.resources

    for (const arn in resourcesToVisualize) {
        const result: VisualResourceDescription | null = transformByConfig(arn, resourcesToVisualize[arn])
        if(result) {
            output.resources[arn] = result
            output.metadata.account = result.accountID
        }
    }
    return output
    
}