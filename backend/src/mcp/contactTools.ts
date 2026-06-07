import { ContactRepository } from '../contacts/contactRepository.js';
import { ContactService } from '../contacts/contactService.js';
import { assertMcpUser } from './toolContext.js';
import type { McpToolContext } from './toolContext.js';

export function createContactTools(context: McpToolContext) {
  const service = new ContactService(new ContactRepository(context.db));
  const user = assertMcpUser(context);
  return {
    'contacts.list': (input: { query?: string; limit?: number; offset?: number }) => service.list(user, input.query, input.limit, input.offset),
    'contacts.create': (input: unknown) => service.create(user, input),
    'contacts.update': (input: { id: string; [key: string]: unknown }) => service.update(user, input.id, input),
    'contacts.delete': (input: { id: string }) => service.delete(user, input.id)
  };
}
