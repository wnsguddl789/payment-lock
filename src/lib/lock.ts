/* eslint-disable @typescript-eslint/no-extraneous-class */
import redis from "./redis";

export class PaymentLock {
  private static readonly LOCK_PREFIX = "payment_lock";
  private static readonly DEFAULT_LOCK_DURATION = 300; // 5 minutes in seconds

  private static getLockKey(userId: string): string {
    return `${this.LOCK_PREFIX}:${userId}`;
  }

  static async acquire(
    userId: string,
    duration: number = this.DEFAULT_LOCK_DURATION,
  ): Promise<boolean> {
    try {
      const lockKey = this.getLockKey(userId);
      const result = await redis.set(
        lockKey,
        Date.now().toString(),
        "NX",
        "EX",
        duration,
      );
      return result === "OK";
    } catch (error) {
      console.error("Failed to acquire lock:", error);
      return false;
    }
  }

  static async release(userId: string): Promise<boolean> {
    try {
      const lockKey = this.getLockKey(userId);
      const result = await redis.del(lockKey);
      return result === 1;
    } catch (error) {
      console.error("Failed to release lock:", error);
      return false;
    }
  }

  static async check(userId: string): Promise<boolean> {
    try {
      const lockKey = this.getLockKey(userId);
      const lockExists = await redis.exists(lockKey);
      return lockExists === 1;
    } catch (error) {
      console.error("Failed to check lock:", error);
      return false;
    }
  }
}
