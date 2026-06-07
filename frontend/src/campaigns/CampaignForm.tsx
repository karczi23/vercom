import React, { useRef, useState } from 'react';
import type { CampaignInput } from '@vercom/common/types/mailing-campaigns';
import { CampaignEditorToolbar } from '../campaign-editor/CampaignEditorToolbar.js';
import { CampaignPreview } from '../campaign-editor/CampaignPreview.js';
import { PellEditor } from '../campaign-editor/PellEditor.js';

interface CampaignFormProps {
  onSubmit: (input: CampaignInput) => Promise<void> | void;
}

export function CampaignForm({ onSubmit }: CampaignFormProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [assignedOperatorId, setAssignedOperatorId] = useState('');
  const editorRootRef = useRef<HTMLDivElement>(null);

  function command(name: string, value?: string) {
    document.execCommand(name, false, value);
    setTemplateContent(editorRootRef.current?.querySelector('.pell-content')?.innerHTML ?? templateContent);
  }

  return (
    <form className="mt-5 grid gap-4 rounded-lg bg-slate-50 p-4" onSubmit={event => {
      event.preventDefault();
      void onSubmit({ name, subject, templateContent, fallbackVariables: {}, assignedOperatorId });
    }}>
      <h3 className="text-base font-semibold text-slate-950">Create campaign</h3>
      <input aria-label="Campaign name" value={name} onChange={event => setName(event.target.value)} />
      <input aria-label="Topic" value={subject} onChange={event => setSubject(event.target.value)} />
      <div ref={editorRootRef} className="overflow-hidden rounded-md border border-slate-300 bg-white">
        <CampaignEditorToolbar
          onBold={() => command('bold')}
          onItalic={() => command('italic')}
          onHeading={level => command('formatBlock', `H${level}`)}
          onFont={font => command('fontName', font)}
        />
        <PellEditor value={templateContent} onChange={value => setTemplateContent(value)} />
      </div>
      {templateContent ? <CampaignPreview html={templateContent} placeholders={extractPlaceholders(templateContent)} /> : null}
      <input aria-label="Assigned operator" value={assignedOperatorId} onChange={event => setAssignedOperatorId(event.target.value)} />
      <div>
        <button type="submit">Save campaign</button>
      </div>
    </form>
  );
}

function extractPlaceholders(content: string): string[] {
  const placeholders = new Set<string>();
  for (const match of content.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)) {
    const name = match[1]?.trim();
    if (name) {
      placeholders.add(name);
    }
  }
  return [...placeholders];
}
