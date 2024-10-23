---
"@mirohq/cloud-data-import": minor
---

- Decoupled service names to support future feature development
- Added new AWS scanning capabilities to the module:
  - `getAwsScanner` for single/multiple service scanning
  - `getAllAwsScanners` to retrieve all available scanners
- Enhanced type safety for scanner implementations
- Reorganized ECS-related components (clusters, tasks, services) into separate files
- Added AWS prefix to core types and operations for better clarity
