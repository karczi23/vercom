import React from 'react';
import type { RecipientSendOutcome } from '@vercom/common/types/campaign-editor';

interface SendOutcomePanelProps {
  items: RecipientSendOutcome[];
  onForceResend: (contactId: string) => void;
}

export function SendOutcomePanel({ items, onForceResend }: SendOutcomePanelProps) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-950">Send outcomes</h3>
      <div className="mt-3 grid gap-2">
        {items.map(item => (
          <div className="grid gap-2 rounded-md border border-slate-200 p-3 md:grid-cols-[1fr_auto]" key={item.contactId}>
            <div>
              <div className="font-medium text-slate-950">{item.contactName}</div>
              <div className="text-sm text-slate-600">{item.contactEmail}</div>
              {item.failureReason ? <div className="mt-1 text-xs text-rose-700">{item.failureReason}</div> : null}
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{item.sendStatus}</span>
              {item.forceResendAllowed ? (
                <button className="rounded-md bg-rose-700 px-3 py-2 text-sm font-medium text-white" type="button" onClick={() => onForceResend(item.contactId)}>
                  Force resend
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
