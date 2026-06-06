import React, { useEffect, useMemo, useState } from 'react';
import type { Contact, ContactInput } from '@vercom/common/types/mailing-campaigns';
import { ApiClient } from '../api/client.js';
import { createContactApi } from './contactApi.js';
import { ContactForm } from './ContactForm.js';

export function ContactsPage() {
  const api = useMemo(() => createContactApi(new ApiClient()), []);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');

  async function load(nextQuery = query) {
    const response = await api.list(nextQuery);
    setContacts(response.items);
  }

  async function save(input: ContactInput) {
    await api.create(input);
    await load();
  }

  useEffect(() => {
    void load('');
  }, []);

  return (
    <section>
      <h1>Contacts</h1>
      <input aria-label="Search contacts" value={query} onChange={event => setQuery(event.target.value)} />
      <button type="button" onClick={() => void load()}>Search</button>
      <ContactForm onSubmit={save} />
      <ul>
        {contacts.map(contact => (
          <li key={contact.id}>{contact.name} &lt;{contact.email}&gt;</li>
        ))}
      </ul>
    </section>
  );
}
