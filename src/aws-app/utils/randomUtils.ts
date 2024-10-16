export const chunkArray = (array: string[], chunkSize: number): string[][] => {
	const chunks: string[][] = []
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize))
	}
	return chunks
}
