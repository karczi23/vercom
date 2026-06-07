import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ApiClient } from '../api/client.js';
import { createCampaignEditorApi } from './campaignEditorApi.js';
import { CampaignEditorToolbar } from './CampaignEditorToolbar.js';
import { CampaignPreview } from './CampaignPreview.js';
import { ForceResendDialog } from './ForceResendDialog.js';
import { PellEditor } from './PellEditor.js';
import { SendOutcomePanel } from './SendOutcomePanel.js';
import type { CampaignEditorDraft, CampaignPreview as Preview, SendOutcomeList } from './campaignEditor.types.js';

interface CampaignEditorPageProps {
  campaignId: string;
  client?: ApiClient;
}

export function CampaignEditorPage({ campaignId, client }: CampaignEditorPageProps) {
  const api = useMemo(() => createCampaignEditorApi(client ?? new ApiClient()), [client]);
  const [draft, setDraft] = useState<CampaignEditorDraft>();
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState<Preview>();
  const [outcomes, setOutcomes] = useState<SendOutcomeList>({ items: [] });
  const [forceContactId, setForceContactId] = useState<string>();
  const [message, setMessage] = useState<string>();
  const editorRootRef = useRef<HTMLDivElement>(null);

  async function load() {
    const loaded = await api.getDraft(campaignId);
    setDraft(loaded);
    setTopic(loaded.topic);
    setContent(loaded.templateContent);
    setPreview(toPreview(loaded.templateContent, loaded.placeholderNames, loaded.sanitizationWarnings));
    setOutcomes(await api.sendOutcomes(campaignId));
  }

  useEffect(() => {
    void load().catch(() => setMessage('Unable to load campaign editor.'));
  }, [campaignId]);

  async function save() {
    const saved = await api.saveDraft(campaignId, { topic, templateContent: content });
    setDraft(saved);
    setPreview(toPreview(saved.templateContent, saved.placeholderNames, saved.sanitizationWarnings));
    setMessage('Saved.');
  }

  async function refreshPreview() {
    setPreview(await api.preview(campaignId, { topic, templateContent: content }));
  }

  function command(name: string, value?: string) {
    document.execCommand(name, false, value);
    setContent(editorRootRef.current?.querySelector('.pell-content')?.innerHTML ?? content);
  }

  return (
    <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Campaign editor</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">{draft?.topic ?? 'Editor'}</h2>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800" type="button" onClick={() => void load()}>Reload</button>
          <button className="rounded-md border border-teal-700 px-3 py-2 text-sm font-medium text-teal-800" type="button" onClick={() => void refreshPreview()}>Preview</button>
          <button className="rounded-md bg-teal-700 px-3 py-2 text-sm font-medium text-white" type="button" onClick={() => void save()}>Save</button>
        </div>
      </div>
      {message ? <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p> : null}
      <label className="grid gap-1 text-sm font-medium text-slate-800">
        Topic
        <input className="rounded-md border border-slate-300 px-3 py-2 text-base font-normal text-slate-950" value={topic} onChange={event => setTopic(event.target.value)} />
      </label>
      <div ref={editorRootRef} className="overflow-hidden rounded-md border border-slate-300">
        <CampaignEditorToolbar
          onBold={() => command('bold')}
          onItalic={() => command('italic')}
          onHeading={level => command('formatBlock', `H${level}`)}
          onFont={font => command('fontName', font)}
        />
        <PellEditor value={content} onChange={value => setContent(value)} />
      </div>
      {content.includes('<') ? <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">Direct HTML is sanitized before save and preview.</p> : null}
      {preview ? <CampaignPreview html={preview.sanitizedHtml} placeholders={preview.placeholderNames} /> : null}
      {forceContactId ? (
        <ForceResendDialog
          contactId={forceContactId}
          onCancel={() => setForceContactId(undefined)}
          onConfirm={async reason => {
            await api.forceResend(campaignId, forceContactId, reason ? { acknowledgedDuplicateRisk: true, reason } : { acknowledgedDuplicateRisk: true });
            setForceContactId(undefined);
            setOutcomes(await api.sendOutcomes(campaignId));
          }}
        />
      ) : null}
      <SendOutcomePanel items={outcomes.items} onForceResend={setForceContactId} />
    </section>
  );
}

function toPreview(sanitizedHtml: string, placeholderNames: string[], warnings?: string[]): Preview {
  return warnings ? { sanitizedHtml, placeholderNames, warnings } : { sanitizedHtml, placeholderNames };
}
