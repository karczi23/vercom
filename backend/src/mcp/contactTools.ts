import { ContactRepository } from '../contacts/contactRepository.js';
import { ContactService } from '../contacts/contactService.js';
import type { McpToolContext } from './toolContext.js';

export function createContactTools(context: McpToolContext) {
  const service = new ContactService(new ContactRepository(context.db));
  return {
    'contacts.list': (input: { query?: string; limit?: number; offset?: number }) => service.list(input.query, input.limit, input.offset),
    'contacts.create': (input: unknown) => service.create(input),
    'contacts.update': (input: { id: string; [key: string]: unknown }) => service.update(input.id, input),
    'contacts.delete': (input: { id: string }) => service.delete(input.id)
  };
}
