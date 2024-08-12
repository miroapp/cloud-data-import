/**
 * Generate a container identifier - this is necessary as some containers such as regions and availability zones are not unique and have same names across different accounts
 */
export const generateContainerIdentifier = (account: string, containerType: string): string => {
	return `${account}/${containerType}`
}
