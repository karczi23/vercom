import React from 'react';
import type { Contact } from '@vercom/common/types/mailing-campaigns';

interface RecipientSelectorProps {
  contacts: Contact[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function RecipientSelector({ contacts, selectedIds, onChange }: RecipientSelectorProps) {
  return (
    <ul className="grid gap-2">
      {contacts.map(contact => (
        <li className="rounded-md border border-slate-200 bg-white px-3 py-2" key={contact.id}>
          <label className="flex grid-cols-none items-center gap-3">
            <input
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-200"
              type="checkbox"
              checked={selectedIds.includes(contact.id)}
              onChange={event => {
                onChange(event.target.checked ? [...selectedIds, contact.id] : selectedIds.filter(id => id !== contact.id));
              }}
            />
            <span><span className="font-medium">{contact.name}</span> <span className="text-slate-500">&lt;{contact.email}&gt;</span></span>
          </label>
        </li>
      ))}
    </ul>
  );
}
