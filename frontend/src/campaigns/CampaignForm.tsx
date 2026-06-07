import React, { useState } from 'react';
import type { CampaignInput } from '@vercom/common/types/mailing-campaigns';

interface CampaignFormProps {
  onSubmit: (input: CampaignInput) => Promise<void> | void;
}

export function CampaignForm({ onSubmit }: CampaignFormProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [assignedOperatorId, setAssignedOperatorId] = useState('');

  return (
    <form className="mt-5 grid gap-4 rounded-lg bg-slate-50 p-4" onSubmit={event => {
      event.preventDefault();
      void onSubmit({ name, subject, templateContent, fallbackVariables: {}, assignedOperatorId });
    }}>
      <h3 className="text-base font-semibold text-slate-950">Create campaign</h3>
      <input aria-label="Campaign name" value={name} onChange={event => setName(event.target.value)} />
      <input aria-label="Subject" value={subject} onChange={event => setSubject(event.target.value)} />
      <textarea aria-label="Template content" value={templateContent} onChange={event => setTemplateContent(event.target.value)} />
      <input aria-label="Assigned operator" value={assignedOperatorId} onChange={event => setAssignedOperatorId(event.target.value)} />
      <div>
        <button type="submit">Save campaign</button>
      </div>
    </form>
  );
}
