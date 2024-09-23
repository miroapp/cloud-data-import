---
"@mirohq/cloud-data-import": minor
---

- (RateLimiter) Implemented strict throttling instead of windowed throttling
- (RateLimiter) Added pause, resume, and abort functionality to rate-limiter
- (RateLimiter) Introduced RetryStrategy concept for customizable retry logic
- (RateLimiter) Created AWSRateLimitExhaustionRetryStrategy based on RetryStrategy
- (lib) Integrated new retry strategy in CLI and exposed via library
