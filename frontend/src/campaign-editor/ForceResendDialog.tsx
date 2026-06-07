import React, { useState } from 'react';

interface ForceResendDialogProps {
  contactId: string;
  onCancel: () => void;
  onConfirm: (reason?: string) => Promise<void>;
}

export function ForceResendDialog({ contactId, onCancel, onConfirm }: ForceResendDialogProps) {
  const [reason, setReason] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="rounded-md border border-rose-200 bg-rose-50 p-4">
      <h3 className="text-sm font-semibold text-rose-950">Force resend acknowledgement</h3>
      <p className="mt-2 text-sm text-rose-900">Recipient {contactId} has an uncertain provider state.</p>
      <label className="mt-3 flex items-start gap-2 text-sm text-rose-950">
        <input checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} type="checkbox" />
        I acknowledge this may duplicate a delivered email.
      </label>
      <textarea className="mt-3 min-h-20 w-full rounded-md border border-rose-200 bg-white p-2 text-sm" value={reason} onChange={event => setReason(event.target.value)} placeholder="Reason" />
      <div className="mt-3 flex gap-2">
        <button className="rounded-md bg-rose-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={!acknowledged} type="button" onClick={() => void onConfirm(reason || undefined)}>
          Queue resend
        </button>
        <button className="rounded-md border border-rose-300 px-3 py-2 text-sm font-medium text-rose-900" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
