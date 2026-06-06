import { describe, expect, it } from 'vitest';
import { InMemoryRateLimitStore } from '../../src/rate-limit/rateLimitMiddleware.js';

describe('rate limit store', () => {
  it('counts requests within a one minute caller window', () => {
    const store = new InMemoryRateLimitStore();

    expect(store.increment('user:1', 0).count).toBe(1);
    expect(store.increment('user:1', 1).count).toBe(2);
    expect(store.increment('user:1', 60_000).count).toBe(1);
  });
});
