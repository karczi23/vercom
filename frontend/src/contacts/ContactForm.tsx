import React, { useState } from 'react';
import type { Contact, ContactInput } from '@vercom/common/types/mailing-campaigns';

interface ContactFormProps {
  initial?: Contact;
  onSubmit: (input: ContactInput) => Promise<void> | void;
}

export function ContactForm({ initial, onSubmit }: ContactFormProps) {
  const [email, setEmail] = useState(initial?.email ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [error, setError] = useState<string>();

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.includes('@')) {
      setError('Email must be valid');
      return;
    }
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setError(undefined);
    await onSubmit({ email, name, personalizationData: initial?.personalizationData ?? {} });
  }

  return (
    <form className="mt-5 grid gap-4 rounded-lg bg-slate-50 p-4" onSubmit={submit}>
      <h3 className="text-base font-semibold text-slate-950">Add contact</h3>
      <label>
        Email
        <input value={email} onChange={event => setEmail(event.target.value)} />
      </label>
      <label>
        Name
        <input value={name} onChange={event => setName(event.target.value)} />
      </label>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
      <div>
        <button type="submit">Save</button>
      </div>
    </form>
  );
}
