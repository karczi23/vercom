import React from 'react';
import type { Contact } from '@vercom/common/types/mailing-campaigns';

interface RecipientSelectorProps {
  contacts: Contact[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function RecipientSelector({ contacts, selectedIds, onChange }: RecipientSelectorProps) {
  return (
    <ul>
      {contacts.map(contact => (
        <li key={contact.id}>
          <label>
            <input
              type="checkbox"
              checked={selectedIds.includes(contact.id)}
              onChange={event => {
                onChange(event.target.checked ? [...selectedIds, contact.id] : selectedIds.filter(id => id !== contact.id));
              }}
            />
            {contact.name} &lt;{contact.email}&gt;
          </label>
        </li>
      ))}
    </ul>
  );
}
