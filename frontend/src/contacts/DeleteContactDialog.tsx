import React from 'react';
import type { Contact } from '@vercom/common/types/mailing-campaigns';

interface DeleteContactDialogProps {
  contact: Contact;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function DeleteContactDialog({ contact, onConfirm, onCancel }: DeleteContactDialogProps) {
  return (
    <div role="dialog" aria-label="Delete contact">
      <p>Delete {contact.email}?</p>
      <button type="button" onClick={onConfirm}>Delete</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </div>
  );
}
