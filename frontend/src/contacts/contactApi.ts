import type { Contact, ContactInput } from '@vercom/common/types/mailing-campaigns';
import type { ApiClient } from '../api/client.js';

export function createContactApi(client: ApiClient) {
  return {
    list(query?: string): Promise<{ items: Contact[] }> {
      const search = query ? `?query=${encodeURIComponent(query)}` : '';
      return client.request(`/contacts${search}`);
    },
    create(input: ContactInput): Promise<Contact> {
      return client.request('/contacts', { method: 'POST', body: JSON.stringify(input) });
    },
    update(id: string, input: ContactInput): Promise<Contact> {
      return client.request(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
    },
    delete(id: string): Promise<void> {
      return client.request(`/contacts/${id}`, { method: 'DELETE' });
    }
  };
}
