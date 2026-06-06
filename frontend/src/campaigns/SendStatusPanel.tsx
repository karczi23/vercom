import React from 'react';
import type { SendAttempt } from '@vercom/common/types/mailing-campaigns';

export function SendStatusPanel({ attempts }: { attempts: SendAttempt[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Send status</h2>
      <ul className="mt-4 grid gap-2">
        {attempts.map(attempt => (
          <li className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700" key={attempt.id}>{attempt.status}{attempt.failureReason ? `: ${attempt.failureReason}` : ''}</li>
        ))}
      </ul>
    </section>
  );
}
