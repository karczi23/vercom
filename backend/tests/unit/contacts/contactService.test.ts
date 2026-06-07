import { describe, expect, it } from 'vitest';
import { ContactService } from '../../../src/contacts/contactService.js';
import type { Contact } from '@vercom/common/types/mailing-campaigns';
import type { AuthenticatedUser } from '@vercom/common/types/shared';

const operatorA: AuthenticatedUser = { id: 'operator-a', username: 'operator-a', role: 'operator' };
const operatorB: AuthenticatedUser = { id: 'operator-b', username: 'operator-b', role: 'operator' };
const admin: AuthenticatedUser = { id: 'admin', username: 'admin', role: 'admin' };

function contact(id: string, owningOperatorId: string, email = 'user@example.com'): Contact {
  return { id, owningOperatorId, email, name: 'User', personalizationData: {}, validationStatus: 'valid' };
}

describe('contact service', () => {
  it('rejects duplicate email for the same operator without modifying existing contact', async () => {
    const existing = contact('c1', operatorA.id);
    const repository = {
      findByEmailForOwner: async (owningOperatorId: string) => owningOperatorId === operatorA.id ? existing : undefined,
      create: async () => {
        throw new Error('should not create');
      }
    };
    const service = new ContactService(repository as never);

    await expect(service.create(operatorA, { email: 'user@example.com', name: 'Other' })).rejects.toMatchObject({
      status: 409,
      code: 'duplicate_contact'
    });
  });

  it('allows different operators to create contacts with the same email', async () => {
    const created = contact('c2', operatorB.id);
    const repository = {
      findByEmailForOwner: async () => undefined,
      create: async (_input: unknown, owningOperatorId: string) => ({ ...created, owningOperatorId })
    };
    const service = new ContactService(repository as never);

    await expect(service.create(operatorB, { email: 'user@example.com', name: 'User' })).resolves.toMatchObject({
      owningOperatorId: operatorB.id,
      email: 'user@example.com'
    });
  });

  it('scopes list results by caller through the repository', async () => {
    const repository = {
      list: async (user: AuthenticatedUser) => user.role === 'admin'
        ? [contact('c1', operatorA.id), contact('c2', operatorB.id)]
        : [contact('c1', user.id)]
    };
    const service = new ContactService(repository as never);

    await expect(service.list(operatorA)).resolves.toHaveLength(1);
    await expect(service.list(admin)).resolves.toHaveLength(2);
  });

  it('does not expose inaccessible contacts through get', async () => {
    const repository = {
      findById: async (user: AuthenticatedUser) => user.id === operatorA.id ? contact('c1', operatorA.id) : undefined
    };
    const service = new ContactService(repository as never);

    await expect(service.get(operatorB, 'c1')).rejects.toMatchObject({ status: 404 });
  });
});
