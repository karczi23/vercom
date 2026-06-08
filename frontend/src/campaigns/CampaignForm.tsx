import React, { useRef, useState } from 'react';
import type { CampaignCreateInput } from '@vercom/common/types/mailing-campaigns';
import { CampaignEditorToolbar } from '../campaign-editor/CampaignEditorToolbar.js';
import { CampaignPreview } from '../campaign-editor/CampaignPreview.js';
import { PellEditor } from '../campaign-editor/PellEditor.js';
import { useRichTextCommands } from '../campaign-editor/useRichTextCommands.js';
import { KeyValueEditor } from '../common/KeyValueEditor.js';

interface CampaignFormProps {
  onSubmit: (input: CampaignCreateInput) => Promise<void> | void;
}

export function CampaignForm({ onSubmit }: CampaignFormProps) {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [fallbackVariables, setFallbackVariables] = useState<Record<string, string>>({});
  const editorRootRef = useRef<HTMLDivElement>(null);
  const { command, setHeading, setParagraph } = useRichTextCommands(editorRootRef, templateContent, setTemplateContent);

  return (
    <form className="mt-5 grid gap-4 rounded-lg bg-slate-50 p-4" onSubmit={event => {
      event.preventDefault();
      void onSubmit({ name, subject, templateContent, fallbackVariables: cleanVariables(fallbackVariables) });
    }}>
      <h3 className="text-base font-semibold text-slate-950">Create campaign</h3>
      <input aria-label="Campaign name" value={name} onChange={event => setName(event.target.value)} />
      <input aria-label="Topic" value={subject} onChange={event => setSubject(event.target.value)} />
      <div ref={editorRootRef} className="overflow-hidden rounded-md border border-slate-300 bg-white">
        <CampaignEditorToolbar
          onBold={() => command('bold')}
          onItalic={() => command('italic')}
          onHeading={setHeading}
          onParagraph={setParagraph}
          onFont={font => command('fontName', font)}
        />
        <PellEditor value={templateContent} onChange={value => setTemplateContent(value)} />
      </div>
      {templateContent ? <CampaignPreview html={templateContent} placeholders={extractPlaceholders(templateContent)} /> : null}
      <KeyValueEditor label="Campaign fallback variables" values={fallbackVariables} onChange={setFallbackVariables} />
      <div>
        <button type="submit">Save campaign</button>
      </div>
    </form>
  );
}

function cleanVariables(values: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).filter(([key]) => key.trim()).map(([key, value]) => [key.trim(), value]));
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
