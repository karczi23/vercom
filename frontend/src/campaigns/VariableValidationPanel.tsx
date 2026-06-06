import React from 'react';

interface ValidationItem {
  contactId: string;
  missingVariables: string[];
  fallbackUsed: boolean;
}

export function VariableValidationPanel({ items }: { items: ValidationItem[] }) {
  return (
    <section>
      <h2>Variable validation</h2>
      <ul>
        {items.map(item => (
          <li key={item.contactId}>
            {item.contactId}: {item.missingVariables.length ? item.missingVariables.join(', ') : 'ready'}
            {item.fallbackUsed ? ' with fallback' : ''}
          </li>
        ))}
      </ul>
    </section>
  );
}
