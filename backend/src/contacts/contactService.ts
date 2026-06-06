import type { Contact, ContactInput } from '@vercom/common/types/mailing-campaigns';
import { ApiError, notFound } from '../common/apiErrors.js';
import type { ContactRepository } from './contactRepository.js';
import { validateContactInput } from './contactValidation.js';

export class ContactService {
  constructor(private readonly repository: ContactRepository) {}

  list(query?: string, limit?: number, offset?: number): Promise<Contact[]> {
    return this.repository.list(query, limit, offset);
  }

  async create(rawInput: unknown): Promise<Contact> {
    const input = validateContactInput(rawInput);
    const duplicate = await this.repository.findByEmail(input.email);
    if (duplicate) {
      throw new ApiError(409, 'duplicate_contact', `Contact email already exists for contact ${duplicate.id}`);
    }
    return this.repository.create(input);
  }

  async get(id: string): Promise<Contact> {
    const contact = await this.repository.findById(id);
    if (!contact) {
      throw notFound('Contact was not found');
    }
    return contact;
  }

  async update(id: string, rawInput: unknown): Promise<Contact> {
    const input: ContactInput = validateContactInput(rawInput);
    const duplicate = await this.repository.findByEmail(input.email);
    if (duplicate && duplicate.id !== id) {
      throw new ApiError(409, 'duplicate_contact', `Contact email already exists for contact ${duplicate.id}`);
    }
    const updated = await this.repository.update(id, input);
    if (!updated) {
      throw notFound('Contact was not found');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw notFound('Contact was not found');
    }
  }
}
