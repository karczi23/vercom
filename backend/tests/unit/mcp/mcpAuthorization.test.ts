import { describe, expect, it } from 'vitest';
import { requireAdmin } from '../../../src/auth/authorization.js';
import { createContactTools } from '../../../src/mcp/contactTools.js';

describe('MCP authorization', () => {
  it('rejects non-admin users for admin-only operations', () => {
    expect(() => requireAdmin({ id: 'operator', username: 'operator', role: 'operator' })).toThrow('Admin role required');
  });

  it('scopes contact tools to the MCP user context', async () => {
    const rows = [{
      id: 'contact-a',
      owningOperatorId: 'operator-a',
      email: 'a@example.com',
      name: 'Anna',
      personalizationData: {},
      validationStatus: 'valid'
    }];
    const db = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: () => ({
              offset: async () => rows
            })
          }),
          limit: () => ({
            offset: async () => rows
          })
        })
      })
    };
    const tools = createContactTools({ db, user: { id: 'operator-a', username: 'operator-a', role: 'operator' } } as never);

    await expect(tools['contacts.list']({})).resolves.toEqual([expect.objectContaining({ owningOperatorId: 'operator-a' })]);
  });
});
