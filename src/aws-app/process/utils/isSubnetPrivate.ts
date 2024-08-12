import {Subnet} from '@aws-sdk/client-ec2'

export function isSubnetPrivate(subnetDescription: Subnet): boolean {
	// Check if MapPublicIpOnLaunch is false
	if (!subnetDescription.MapPublicIpOnLaunch) {
		return true
	}

	// Check if the CIDR block is within private IP ranges
	const privateRanges = [/^10\./, /^172\.(1[6-9]|2[0-9]|3[0-1])\./, /^192\.168\./]
	if (privateRanges.some((range) => range.test(subnetDescription.CidrBlock || ''))) {
		return true
	}

	// Check PrivateDnsNameOptionsOnLaunch if available
	if (subnetDescription.PrivateDnsNameOptionsOnLaunch) {
		if (
			!subnetDescription.PrivateDnsNameOptionsOnLaunch.EnableResourceNameDnsARecord &&
			!subnetDescription.PrivateDnsNameOptionsOnLaunch.EnableResourceNameDnsAAAARecord
		) {
			return true
		}
	}

	// Check if IPv6 is not configured
	if (subnetDescription.Ipv6CidrBlockAssociationSet?.length === 0) {
		return true
	}

	return false
}
