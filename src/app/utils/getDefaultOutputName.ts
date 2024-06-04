const pad = (num: number) => String(num).padStart(2, '0')

export const getDefaultOutputName = () => {
	const now = new Date()

	const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(
		now.getMinutes(),
	)}${pad(now.getSeconds())}`

	return `miro-cloudview-${timestamp}.json`
}
