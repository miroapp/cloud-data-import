import {getAwsProcessedData} from '@/aws-app/process'
import {createRateLimiter, getAllAwsScanners, getAwsScanner, getTagsScanner} from '@/scanners'

export type {
	GetAwsResourceScannerArguments,
	GetAllAwsResourceScannersArguments,
	GetAwsTagsScannerArguments,
} from '@/scanners'
export type * from '@/types'

export {awsRegionIds} from '@/constants'

export {AWSRateLimitExhaustionRetryStrategy} from '@/aws-app/utils/AWSRateLimitExhaustionRetryStrategy'

/**
 * @public
 * @experimental This export is experimental and may change or be removed in future versions.
 * Use with caution.
 * @remarks
 * WARNING: This is an experimental API. It may undergo significant changes or be removed entirely in non-major version updates.
 * Before using this in production, please consider the following:
 * - This API is not covered by semantic versioning guarantees.
 * - Breaking changes may occur in minor or patch releases.
 * - Always check the changelog before updating, even for non-major versions.
 * - If you depend on this feature, consider pinning your package version to avoid unexpected breaks.
 */
export const experimental_createRateLimiter = createRateLimiter

/**
 * @public
 * @experimental This export is experimental and may change or be removed in future versions.
 * Use with caution.
 * @remarks
 * WARNING: This is an experimental API. It may undergo significant changes or be removed entirely in non-major version updates.
 * Before using this in production, please consider the following:
 * - This API is not covered by semantic versioning guarantees.
 * - Breaking changes may occur in minor or patch releases.
 * - Always check the changelog before updating, even for non-major versions.
 * - If you depend on this feature, consider pinning your package version to avoid unexpected breaks.
 */
export const experimental_getAllAwsScanners = getAllAwsScanners

/**
 * @public
 * @experimental This export is experimental and may change or be removed in future versions.
 * Use with caution.
 * @remarks
 * WARNING: This is an experimental API. It may undergo significant changes or be removed entirely in non-major version updates.
 * Before using this in production, please consider the following:
 * - This API is not covered by semantic versioning guarantees.
 * - Breaking changes may occur in minor or patch releases.
 * - Always check the changelog before updating, even for non-major versions.
 * - If you depend on this feature, consider pinning your package version to avoid unexpected breaks.
 */
export const experimental_getAwsScanner = getAwsScanner

/**
 * @public
 * @experimental This export is experimental and may change or be removed in future versions.
 * Use with caution.
 * @remarks
 * WARNING: This is an experimental API. It may undergo significant changes or be removed entirely in non-major version updates.
 * Before using this in production, please consider the following:
 * - This API is not covered by semantic versioning guarantees.
 * - Breaking changes may occur in minor or patch releases.
 * - Always check the changelog before updating, even for non-major versions.
 * - If you depend on this feature, consider pinning your package version to avoid unexpected breaks.
 */
export const experimental_getTagsScanner = getTagsScanner

/**
 * @public
 * @experimental This export is experimental and may change or be removed in future versions.
 * Use with caution.
 * @remarks
 * WARNING: This is an experimental API. It may undergo significant changes or be removed entirely in non-major version updates.
 * Before using this in production, please consider the following:
 * - This API is not covered by semantic versioning guarantees.
 * - Breaking changes may occur in minor or patch releases.
 * - Always check the changelog before updating, even for non-major versions.
 * - If you depend on this feature, consider pinning your package version to avoid unexpected breaks.
 */
export const experimental_getAwsProcessedData = getAwsProcessedData
