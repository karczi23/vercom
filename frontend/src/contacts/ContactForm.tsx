import React, { useState } from 'react';
import type { Contact, ContactInput } from '@vercom/common/types/mailing-campaigns';
import { KeyValueEditor } from '../common/KeyValueEditor.js';

interface ContactFormProps {
  initial?: Contact;
  onSubmit: (input: ContactInput) => Promise<void> | void;
}

export function ContactForm({ initial, onSubmit }: ContactFormProps) {
  const [email, setEmail] = useState(initial?.email ?? '');
  const [name, setName] = useState(initial?.name ?? '');
  const [personalizationData, setPersonalizationData] = useState<Record<string, string>>(initial?.personalizationData ?? {});
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
    await onSubmit({ email, name, personalizationData: cleanVariables(personalizationData) });
  }

  return (
    <form className="mt-5 grid gap-4 rounded-lg bg-slate-50 p-4" onSubmit={submit}>
      <h3 className="text-base font-semibold text-slate-950">{initial ? 'Edit contact' : 'Add contact'}</h3>
      <label>
        Email
        <input value={email} onChange={event => setEmail(event.target.value)} />
      </label>
      <label>
        Name
        <input value={name} onChange={event => setName(event.target.value)} />
      </label>
      <KeyValueEditor label="Contact variables" values={personalizationData} onChange={setPersonalizationData} />
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
      <div>
        <button type="submit">Save</button>
      </div>
    </form>
  );
}

function cleanVariables(values: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).filter(([key]) => key.trim()).map(([key, value]) => [key.trim(), value]));
}
