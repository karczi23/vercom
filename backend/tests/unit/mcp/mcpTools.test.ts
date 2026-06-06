import { describe, expect, it } from 'vitest';
import { assertMcpUser } from '../../../src/mcp/toolContext.js';

describe('MCP tools', () => {
  it('requires a user context', () => {
    expect(() => assertMcpUser({ user: undefined, db: {} } as never)).toThrow('MCP user context is required');
  });
});
