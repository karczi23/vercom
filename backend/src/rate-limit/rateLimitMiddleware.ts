import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../common/apiErrors.js';

export function getCallerKey(req: Request): string {
  return req.user ? `user:${req.user.id}` : `ip:${req.ip ?? 'unknown'}`;
}

export class InMemoryRateLimitStore {
  private readonly windows = new Map<string, { startsAt: number; count: number }>();

  increment(key: string, now = Date.now()): { count: number; retryAfterSeconds: number } {
    const minute = 60_000;
    const current = this.windows.get(key);
    if (!current || now - current.startsAt >= minute) {
      this.windows.set(key, { startsAt: now, count: 1 });
      return { count: 1, retryAfterSeconds: 0 };
    }
    current.count += 1;
    return { count: current.count, retryAfterSeconds: Math.ceil((minute - (now - current.startsAt)) / 1000) };
  }
}

export function createRateLimitMiddleware(limitPerMinute = 10, store = new InMemoryRateLimitStore()) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = store.increment(getCallerKey(req));
    if (result.count > limitPerMinute) {
      res.setHeader('Retry-After', String(result.retryAfterSeconds));
      next(new ApiError(429, 'rate_limited', 'Too many requests. Retry after the indicated number of seconds.'));
      return;
    }
    next();
  };
}
