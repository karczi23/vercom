import { describe, expect, it } from 'vitest';
import { AuthService } from '../../src/auth/authService.js';
import { hashPassword } from '../../src/auth/passwordHash.js';
import { signAccessToken, verifyAccessToken } from '../../src/auth/tokenService.js';
import type { Database } from '../../src/db/client.js';

describe('auth utilities', () => {
  it('signs and verifies short-lived access tokens', () => {
    const signed = signAccessToken({ id: 'u1', username: 'operator', role: 'operator' }, 'secret');
    const verified = verifyAccessToken(signed.accessToken, 'secret');

    expect(verified).toMatchObject({ id: 'u1', username: 'operator', role: 'operator' });
    expect(signed.expiresInSeconds).toBe(900);
  });

  it('authenticates stored users with a valid password', async () => {
    const auth = new AuthService(fakeDb([{ id: 'u1', username: 'admin', role: 'admin', passwordHash: await hashPassword('secret') }]));

    await expect(auth.login('admin', 'secret')).resolves.toMatchObject({ id: 'u1', username: 'admin', role: 'admin' });
  });

  it('rejects invalid stored-user credentials', async () => {
    const auth = new AuthService(fakeDb([{ id: 'u1', username: 'admin', role: 'admin', passwordHash: await hashPassword('secret') }]));

    await expect(auth.login('admin', 'wrong')).rejects.toMatchObject({ status: 401, code: 'unauthorized' });
    await expect(new AuthService(fakeDb([])).login('missing', 'secret')).rejects.toMatchObject({ status: 401, code: 'unauthorized' });
  });
});

function fakeDb(rows: unknown[]): Database {
  return {
    select() {
      return {
        from() {
          return {
            where() {
              return {
                limit() {
                  return Promise.resolve(rows);
                }
              };
            }
          };
        }
      };
    }
  } as unknown as Database;
}
