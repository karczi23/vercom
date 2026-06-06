import { describe, expect, it } from 'vitest';
import { ContactService } from '../../../src/contacts/contactService.js';

describe('contact service', () => {
  it('rejects duplicate email without modifying existing contact', async () => {
    const existing = { id: 'c1', email: 'user@example.com', name: 'User', personalizationData: {}, validationStatus: 'valid' as const };
    const repository = {
      findByEmail: async () => existing,
      create: async () => {
        throw new Error('should not create');
      }
    };
    const service = new ContactService(repository as never);

    await expect(service.create({ email: 'user@example.com', name: 'Other' })).rejects.toMatchObject({
      status: 409,
      code: 'duplicate_contact'
    });
  });
});
