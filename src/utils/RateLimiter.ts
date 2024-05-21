const BASE_RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 6; // last attempt will take 64 seconds (2^6 = 64 * base retry delay) and overall will take 127 seconds for all retries to complete

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class RateLimiter {
    private per: number;
    private allowance: number;
    private lastCheck: number;
    private maxUsage: number;
  
    constructor(rate: number, per: number, usagePercentage: number = 0.6) {
      this.per = per;
      this.maxUsage = rate * usagePercentage;
      this.allowance = rate;
      this.lastCheck = Date.now();
    }
  
    private async acquire() {
      const current = Date.now();
      const timePassed = current - this.lastCheck;
      this.lastCheck = current;
      this.allowance += (timePassed / this.per) * this.maxUsage;
  
      if (this.allowance > this.maxUsage) {
        this.allowance = this.maxUsage;
      }
  
      if (this.allowance < 1) {
        const waitTime = (1 - this.allowance) * (this.per / this.maxUsage);
        await sleep(waitTime);
        this.allowance = 0;
      } else {
        this.allowance -= 1;
      }
    }

    async throttle<U>(fn: () => Promise<U>): Promise<U> {
      let attempt = 0;
      while (attempt < MAX_RETRIES) {
        try {
          await this.acquire();
          return await fn();
        } catch (error: any) {
          if (error.name === "ThrottlingException" || error.name === "ProvisionedThroughputExceededException" || error.name === "RequestLimitExceeded") {
            attempt++;
            // exponential backoff
            await sleep(BASE_RETRY_DELAY * Math.pow(2, attempt));
          } else {
            throw error;
          }
        }
      }
      throw new Error("Max retries reached");
    }
}
