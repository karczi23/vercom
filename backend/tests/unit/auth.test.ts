import { describe, expect, it } from 'vitest';
import { signAccessToken, verifyAccessToken } from '../../src/auth/tokenService.js';

describe('auth utilities', () => {
  it('signs and verifies short-lived access tokens', () => {
    const signed = signAccessToken({ id: 'u1', username: 'operator', role: 'operator' }, 'secret');
    const verified = verifyAccessToken(signed.accessToken, 'secret');

    expect(verified).toMatchObject({ id: 'u1', username: 'operator', role: 'operator' });
    expect(signed.expiresInSeconds).toBe(900);
  });
});
