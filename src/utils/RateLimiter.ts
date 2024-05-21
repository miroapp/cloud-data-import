const BASE_RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 6; // last attempt will take 64 seconds (2^6 = 64 * base retry delay) and overall will take 127 seconds for all retries to complete
const CAPACITY_USAGE_PERCENTAGE = 0.6;

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class RateLimiter {
  private per: number;
  private allowance: number;
  private lastCheck: number;
  private maxUsage: number;
  private queue: (() => void)[];

  constructor(rate: number, per: number) {
    this.per = per;
    this.maxUsage = rate * CAPACITY_USAGE_PERCENTAGE;
    this.allowance = this.maxUsage;
    this.lastCheck = Date.now();
    this.queue = [];
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
    return new Promise<U>((resolve, reject) => {
      const execute = async () => {
        try {
          await this.acquire();
          resolve(await fn());
        } catch (error: any) {
          if (error.name === "ThrottlingException" || error.name === "ProvisionedThroughputExceededException" || error.name === "RequestLimitExceeded") {
            this.retry(fn, resolve, reject, 1);
          } else {
            reject(error);
          }
        }
      };

      this.queue.push(execute);

      if (this.queue.length === 1) {
        this.dequeue();
      }
    });
  }

  private async retry<U>(fn: () => Promise<U>, resolve: (value: U | PromiseLike<U>) => void, reject: (reason?: any) => void, attempt: number) {
    if (attempt < MAX_RETRIES) {
      await sleep(BASE_RETRY_DELAY * Math.pow(2, attempt));
      try {
        await this.acquire();
        resolve(await fn());
      } catch (error: any) {
        if (error.name === "ThrottlingException" || error.name === "ProvisionedThroughputExceededException" || error.name === "RequestLimitExceeded") {
          this.retry(fn, resolve, reject, attempt + 1);
        } else {
          reject(error);
        }
      }
    } else {
      reject(new Error("Max retries reached"));
    }
  }

  private async dequeue() {
    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) await fn();
    }
  }
}
