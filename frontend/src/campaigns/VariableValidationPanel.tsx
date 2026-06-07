import React from 'react';

interface ValidationItem {
  contactId: string;
  missingVariables: string[];
  fallbackUsed: boolean;
}

export function VariableValidationPanel({ items }: { items: ValidationItem[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Variable validation</h2>
      <ul className="mt-4 grid gap-2">
        {items.map(item => (
          <li className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700" key={item.contactId}>
            {item.contactId}: {item.missingVariables.length ? item.missingVariables.join(', ') : 'ready'}
            {item.fallbackUsed ? ' with fallback' : ''}
          </li>
        ))}
      </ul>
    </section>
  );
}
