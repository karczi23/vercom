import type { Contact, ContactInput } from '@vercom/common/types/mailing-campaigns';
import type { AuthenticatedUser } from '@vercom/common/types/shared';
import { ApiError, notFound } from '../common/apiErrors.js';
import type { ContactRepository } from './contactRepository.js';
import { validateContactInput } from './contactValidation.js';

export class ContactService {
  constructor(private readonly repository: ContactRepository) {}

  list(user: AuthenticatedUser, query?: string, limit?: number, offset?: number): Promise<Contact[]> {
    return this.repository.list(user, query, limit, offset);
  }

  async create(user: AuthenticatedUser, rawInput: unknown): Promise<Contact> {
    const input = validateContactInput(rawInput);
    const duplicate = await this.repository.findByEmailForOwner(user.id, input.email);
    if (duplicate) {
      throw new ApiError(409, 'duplicate_contact', `Contact email already exists for contact ${duplicate.id}`);
    }
    return this.repository.create(input, user.id);
  }

  async get(user: AuthenticatedUser, id: string): Promise<Contact> {
    const contact = await this.repository.findById(user, id);
    if (!contact) {
      throw notFound('Contact was not found');
    }
    return contact;
  }

  async update(user: AuthenticatedUser, id: string, rawInput: unknown): Promise<Contact> {
    const input: ContactInput = validateContactInput(rawInput);
    const existing = await this.repository.findById(user, id);
    if (!existing) {
      throw notFound('Contact was not found');
    }
    const duplicate = await this.repository.findByEmailForOwner(existing.owningOperatorId, input.email);
    if (duplicate && duplicate.id !== id) {
      throw new ApiError(409, 'duplicate_contact', `Contact email already exists for contact ${duplicate.id}`);
    }
    const updated = await this.repository.update(user, id, input);
    if (!updated) {
      throw notFound('Contact was not found');
    }
    return updated;
  }

  async delete(user: AuthenticatedUser, id: string): Promise<void> {
    const deleted = await this.repository.delete(user, id);
    if (!deleted) {
      throw notFound('Contact was not found');
    }
  }
}
