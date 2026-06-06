import React from 'react';
import type { SendAttempt } from '@vercom/common/types/mailing-campaigns';

export function SendStatusPanel({ attempts }: { attempts: SendAttempt[] }) {
  return (
    <section>
      <h2>Send status</h2>
      <ul>
        {attempts.map(attempt => (
          <li key={attempt.id}>{attempt.status}{attempt.failureReason ? `: ${attempt.failureReason}` : ''}</li>
        ))}
      </ul>
    </section>
  );
}
