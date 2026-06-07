import { describe, expect, it } from 'vitest';
import { canAccessCampaign } from '../../src/auth/authorization.js';
import { ContactService } from '../../src/contacts/contactService.js';

describe('operator campaign access', () => {
  it('allows admins without campaign assignment lookup', async () => {
    await expect(canAccessCampaign({} as never, { id: 'admin', username: 'admin', role: 'admin' }, 'campaign')).resolves.toBe(true);
  });

  it('blocks operators from reading contacts owned by other operators', async () => {
    const service = new ContactService({
      findById: async () => undefined
    } as never);

    await expect(service.get({ id: 'operator-b', username: 'operator-b', role: 'operator' }, 'operator-a-contact')).rejects.toMatchObject({
      status: 404,
      code: 'not_found'
    });
  });
});
