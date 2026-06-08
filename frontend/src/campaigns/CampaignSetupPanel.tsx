import React, { useEffect, useMemo, useState } from 'react';
import type { Campaign, Contact } from '@vercom/common/types/mailing-campaigns';
import { KeyValueEditor } from '../common/KeyValueEditor.js';
import { RecipientSelector } from './RecipientSelector.js';
import type { VariableValidationResponse } from './campaignApi.js';

interface CampaignSetupPanelProps {
  campaign: Campaign;
  contacts: Contact[];
  loadRecipients: (campaignId: string) => Promise<string[]>;
  onSaveRecipients: (campaignId: string, contactIds: string[]) => Promise<void>;
  onSaveFallbackVariables: (campaign: Campaign, fallbackVariables: Record<string, string>) => Promise<void>;
  onValidateAndSend: (campaign: Campaign) => Promise<VariableValidationResponse | undefined>;
}

export function CampaignSetupPanel({
  campaign,
  contacts,
  loadRecipients,
  onSaveRecipients,
  onSaveFallbackVariables,
  onValidateAndSend
}: CampaignSetupPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [fallbackVariables, setFallbackVariables] = useState<Record<string, string>>(campaign.fallbackVariables ?? {});
  const [validation, setValidation] = useState<VariableValidationResponse>();
  const [message, setMessage] = useState<string>();
  const placeholders = useMemo(() => extractPlaceholders(campaign.templateContent), [campaign.templateContent]);

  useEffect(() => {
    setFallbackVariables(campaign.fallbackVariables ?? {});
    void loadRecipients(campaign.id).then(setSelectedIds).catch(() => setMessage('Unable to load selected recipients.'));
  }, [campaign.id]);

  async function saveRecipients() {
    await onSaveRecipients(campaign.id, selectedIds);
    setMessage('Recipients saved.');
  }

  async function saveFallbackVariables() {
    await onSaveFallbackVariables(campaign, cleanVariables(fallbackVariables));
    setMessage('Fallback variables saved.');
  }

  async function send() {
    if (selectedIds.length === 0) {
      setMessage('Select at least one recipient before sending.');
      return;
    }
    const result = await onValidateAndSend(campaign);
    if (result) {
      setValidation(result);
      setMessage(result.approved ? 'Send queued.' : 'Resolve missing variables before sending.');
    }
  }

  return (
    <section className="mt-4 grid gap-4 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Campaign setup</h3>
          <div className="mt-1 flex flex-wrap gap-2">
            {placeholders.length > 0 ? placeholders.map(name => (
              <span className="rounded bg-teal-50 px-2 py-1 text-xs text-teal-800" key={name}>{`{{ ${name} }}`}</span>
            )) : <span className="text-sm text-slate-500">No placeholders detected.</span>}
          </div>
        </div>
        {(campaign.status === 'draft' || campaign.status === 'ready') ? (
          <button type="button" onClick={() => void send()}>
            {campaign.status === 'draft' ? 'Validate & send' : 'Send'}
          </button>
        ) : null}
      </div>
      {message ? <p className="rounded-md bg-white px-3 py-2 text-sm text-slate-700">{message}</p> : null}
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-slate-800">Recipients</h4>
          <button className="border border-teal-700 bg-white text-teal-800 hover:bg-teal-50" type="button" onClick={() => void saveRecipients()}>
            Save recipients
          </button>
        </div>
        <RecipientSelector contacts={contacts} selectedIds={selectedIds} onChange={setSelectedIds} />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-slate-800">Fallback variables</h4>
          <button className="border border-teal-700 bg-white text-teal-800 hover:bg-teal-50" type="button" onClick={() => void saveFallbackVariables()}>
            Save variables
          </button>
        </div>
        <KeyValueEditor label="Campaign fallback variables" values={fallbackVariables} onChange={setFallbackVariables} />
      </div>
      {validation ? (
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <h4 className="text-sm font-semibold text-slate-800">Validation</h4>
          <ul className="mt-2 grid gap-2">
            {validation.items.map(item => (
              <li className="text-sm text-slate-700" key={item.contactId}>
                {contactLabel(contacts, item.contactId)}: {item.missingVariables.length ? `missing ${item.missingVariables.join(', ')}` : 'ready'}
                {item.fallbackUsed ? ' with fallback' : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function extractPlaceholders(content: string): string[] {
  const placeholders = new Set<string>();
  for (const match of content.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)) {
    const name = match[1]?.trim();
    if (name) placeholders.add(name);
  }
  return [...placeholders];
}

function cleanVariables(values: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).filter(([key]) => key.trim()).map(([key, value]) => [key.trim(), value]));
}

function contactLabel(contacts: Contact[], contactId: string): string {
  const contact = contacts.find(item => item.id === contactId);
  return contact ? `${contact.name} <${contact.email}>` : contactId;
}
