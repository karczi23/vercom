import { describe, expect, it } from 'vitest';
import { canAccessCampaign } from '../../src/auth/authorization.js';

describe('operator campaign access', () => {
  it('allows admins without campaign assignment lookup', async () => {
    await expect(canAccessCampaign({} as never, { id: 'admin', username: 'admin', role: 'admin' }, 'campaign')).resolves.toBe(true);
  });
});
