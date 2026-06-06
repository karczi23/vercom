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
    <form onSubmit={submit}>
      <label>
        Email
        <input value={email} onChange={event => setEmail(event.target.value)} />
      </label>
      <label>
        Name
        <input value={name} onChange={event => setName(event.target.value)} />
      </label>
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit">Save</button>
    </form>
  );
}
