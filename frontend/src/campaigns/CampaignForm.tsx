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
    <form onSubmit={event => {
      event.preventDefault();
      void onSubmit({ name, subject, templateContent, fallbackVariables: {}, assignedOperatorId });
    }}>
      <input aria-label="Campaign name" value={name} onChange={event => setName(event.target.value)} />
      <input aria-label="Subject" value={subject} onChange={event => setSubject(event.target.value)} />
      <textarea aria-label="Template content" value={templateContent} onChange={event => setTemplateContent(event.target.value)} />
      <input aria-label="Assigned operator" value={assignedOperatorId} onChange={event => setAssignedOperatorId(event.target.value)} />
      <button type="submit">Save campaign</button>
    </form>
  );
}
