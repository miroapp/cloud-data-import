const BASE_RETRY_DELAY = 1000; // 1 second
const MAX_RETRIES = 6; // last attempt will take 64 seconds (2^6 = 64 * base retry delay) and overall will take 127 seconds for all retries to complete, before giving up
const CAPACITY_USAGE_PERCENTAGE = 0.6;

const ONE_SECOND = 1000;

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class RateLimiter {
  private allowance: number;
  private lastCheck: number;
  private maxUsage: number;
  private queue: (() => void)[];

  constructor(rate: number) {
    this.maxUsage = rate * CAPACITY_USAGE_PERCENTAGE;
    this.allowance = this.maxUsage;
    this.lastCheck = Date.now();
    this.queue = [];
  }

  // Acquire permission to proceed with a function call
  private async acquire() {
    const current = Date.now();
    const timePassed = current - this.lastCheck;
    this.lastCheck = current;
    this.allowance += (timePassed / ONE_SECOND) * this.maxUsage;

    if (this.allowance > this.maxUsage) {
      this.allowance = this.maxUsage;
    }

    // If allowance is insufficient, wait for more capacity
    if (this.allowance < 1) {
      const waitTime = (1 - this.allowance) * (ONE_SECOND / this.maxUsage);
      await sleep(waitTime);
      this.allowance = 0;
    } else {
      this.allowance -= 1;
    }
  }

  // Throttle function execution
  async throttle<U>(fn: () => Promise<U>): Promise<U> {
    return new Promise<U>((resolve, reject) => {
      const execute = async () => {
        try {
          await this.acquire();
          resolve(await fn());
        } catch (error: any) {
          if (this.isRequestLimitError(error)) {
            this.retry(fn, resolve, reject, 1);
          } else {
            reject(error);
          }
        }
      };

      this.queue.push(execute);

      // If it's the only function in the queue, it means that we just added it. So we should start the process.
      // But, if it's more in the queue, it means that we are already processing the queue, and the function will be processed when it's its turn.
      if (this.queue.length === 1) {
        this.dequeue();
      }
    });
  }

  // Retry function with exponential backoff
  private async retry<U>(fn: () => Promise<U>, resolve: (value: U | PromiseLike<U>) => void, reject: (reason?: any) => void, attempt: number) {
    if (attempt < MAX_RETRIES) {
      // Exponential backoff
      // https://en.wikipedia.org/wiki/Exponential_backoff
      await sleep(BASE_RETRY_DELAY * Math.pow(2, attempt));
      try {
        // acquire permission to proceed and add enough sleep time
        await this.acquire();
        resolve(await fn());
      } catch (error: any) {
        if (this.isRequestLimitError(error)) {
          this.retry(fn, resolve, reject, attempt + 1);
        } else {
          reject(error);
        }
      }
    } else {
      reject(new Error("Max retries reached"));
    }
  }

  // Check if error is a request limit error
  private isRequestLimitError(error: Error) {
    return ["ThrottlingException", "ProvisionedThroughputExceededException", "RequestLimitExceeded"].includes(error.name);
  }

  // Process the queue of function calls
  // @idea Maybe we can add some lifecycle hooks here in the future?
  private async dequeue() {
    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      if (fn) await fn();
    }
  }
}
