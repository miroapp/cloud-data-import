import {PlacementData} from '../types'

export type GroupedArns = {
	[type: string]: string[]
}

export const groupArnsBasedOnType = (placementData: PlacementData): GroupedArns => {
	const groupedArns: GroupedArns = {}

	Object.entries(placementData).forEach(([arn, data]) => {
		const {type} = data
		if (!groupedArns[type]) {
			groupedArns[type] = []
		}
		groupedArns[type].push(arn)
	})

	return groupedArns
}
