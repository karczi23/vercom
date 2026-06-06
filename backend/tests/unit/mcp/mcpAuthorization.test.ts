import { describe, expect, it } from 'vitest';
import { requireAdmin } from '../../../src/auth/authorization.js';

describe('MCP authorization', () => {
  it('rejects non-admin users for admin-only operations', () => {
    expect(() => requireAdmin({ id: 'operator', username: 'operator', role: 'operator' })).toThrow('Admin role required');
  });
});
