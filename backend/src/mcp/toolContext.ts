import type { AuthenticatedUser } from '@vercom/common/types/shared';
import type { Database } from '../db/client.js';

export interface McpToolContext {
  db: Database;
  user: AuthenticatedUser;
}

export function assertMcpUser(context: McpToolContext): AuthenticatedUser {
  if (!context.user) {
    throw new Error('MCP user context is required');
  }
  return context.user;
}
