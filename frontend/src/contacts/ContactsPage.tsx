import React, { useEffect, useMemo, useState } from 'react';
import type { Contact, ContactInput } from '@vercom/common/types/mailing-campaigns';
import { ApiClient } from '../api/client.js';
import type { AuthState } from '../auth/authStore.js';
import { createContactApi } from './contactApi.js';
import { ContactForm } from './ContactForm.js';

interface ContactsPageProps {
  client?: ApiClient;
  auth?: AuthState;
}

export function ContactsPage({ client, auth }: ContactsPageProps) {
  const api = useMemo(() => createContactApi(client ?? new ApiClient()), [client]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string>();

  async function load(nextQuery = query) {
    try {
      const response = await api.list(nextQuery);
      setContacts(response.items);
      setError(undefined);
    } catch {
      setError('Sign in to load contacts.');
    }
  }

  async function save(input: ContactInput) {
    await api.create(input);
    await load();
  }

  useEffect(() => {
    if (!auth?.accessToken) {
      setContacts([]);
      setError('Sign in to load contacts.');
      return;
    }
    void load('');
  }, [auth?.accessToken]);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Audience</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Contacts</h2>
        </div>
        <div className="flex w-full gap-2 md:max-w-md">
          <input aria-label="Search contacts" placeholder="Search by name or email" value={query} onChange={event => setQuery(event.target.value)} />
          <button type="button" onClick={() => void load()}>Search</button>
        </div>
      </div>
      {error ? <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">{error}</p> : null}
      <ContactForm onSubmit={save} />
      <ul className="mt-5 divide-y divide-slate-100 rounded-md border border-slate-200">
        {contacts.map(contact => (
          <li className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" key={contact.id}>
            <span className="font-medium text-slate-900">{contact.name}</span>
            <span className="text-sm text-slate-600">{contact.email}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
