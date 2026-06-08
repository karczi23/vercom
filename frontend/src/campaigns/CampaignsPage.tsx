import React, { useEffect, useMemo, useState } from 'react';
import type { Campaign, Contact } from '@vercom/common/types/mailing-campaigns';
import { ApiClient } from '../api/client.js';
import type { AuthState } from '../auth/authStore.js';
import { createCampaignApi } from './campaignApi.js';
import { AssignedCampaignSelector } from './AssignedCampaignSelector.js';
import { CampaignForm } from './CampaignForm.js';
import { CampaignSetupPanel } from './CampaignSetupPanel.js';
import { createContactApi } from '../contacts/contactApi.js';
import { createSendApi } from './sendApi.js';

interface CampaignsPageProps {
  client?: ApiClient;
  auth?: AuthState;
  onEditCampaign?: (campaignId: string) => void;
}

export function CampaignsPage({ client, auth, onEditCampaign }: CampaignsPageProps) {
  const api = useMemo(() => createCampaignApi(client ?? new ApiClient()), [client]);
  const contactApi = useMemo(() => createContactApi(client ?? new ApiClient()), [client]);
  const sendApi = useMemo(() => createSendApi(client ?? new ApiClient()), [client]);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedEditorId, setSelectedEditorId] = useState<string>();
  const [error, setError] = useState<string>();

  async function load() {
    try {
      const allCampaigns = (await api.list()).items;
      setContacts((await contactApi.list()).items);
      setAvailableCampaigns(allCampaigns);
      const nextSelectedEditorId = selectedEditorId ?? allCampaigns[0]?.assignedOperatorId;
      setSelectedEditorId(nextSelectedEditorId);
      setCampaigns(nextSelectedEditorId ? (await api.list({ assignedEditorId: nextSelectedEditorId })).items : allCampaigns);
      setError(undefined);
    } catch {
      setError('Sign in to load campaigns.');
    }
  }

  useEffect(() => {
    if (!auth?.accessToken) {
      setAvailableCampaigns([]);
      setCampaigns([]);
      setContacts([]);
      setSelectedEditorId(undefined);
      setError('Sign in to load campaigns.');
      return;
    }
    void load();
  }, [auth?.accessToken]);

  async function selectEditor(editorId: string) {
    setSelectedEditorId(editorId);
    try {
      setCampaigns((await api.list({ assignedEditorId: editorId })).items);
      setError(undefined);
    } catch {
      setError('Unable to load campaigns for this editor.');
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Messaging</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">Campaigns</h2>
      </div>
      {error ? <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">{error}</p> : null}
      <div className="mt-4">
        <AssignedCampaignSelector
          campaigns={availableCampaigns}
          selectedEditorId={selectedEditorId}
          visibleCampaignCount={campaigns.length}
          onSelectEditor={editorId => { void selectEditor(editorId); }}
        />
      </div>
      <CampaignForm onSubmit={async input => { await api.create(input); await load(); }} />
      <ul className="mt-5 grid gap-3">
        {campaigns.map(campaign => (
          <li className="rounded-md border border-slate-200 px-4 py-3" key={campaign.id}>
            <div className="font-medium text-slate-950">{campaign.name}</div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <div className="text-sm text-slate-600">{campaign.status}</div>
              {onEditCampaign ? (
                <button className="rounded-md border border-teal-700 px-3 py-2 text-sm font-medium text-teal-800" type="button" onClick={() => onEditCampaign(campaign.id)}>
                  Editor
                </button>
              ) : null}
            </div>
            {(campaign.status === 'draft' || campaign.status === 'ready') ? (
              <CampaignSetupPanel
                campaign={campaign}
                contacts={contacts}
                loadRecipients={async campaignId => (await api.recipients(campaignId)).contactIds}
                onSaveRecipients={async (campaignId, contactIds) => {
                  await api.replaceRecipients(campaignId, contactIds);
                  await load();
                }}
                onSaveFallbackVariables={async (currentCampaign, fallbackVariables) => {
                  await api.update(currentCampaign.id, { ...currentCampaign, fallbackVariables });
                  await load();
                }}
                onValidateAndSend={async currentCampaign => {
                  if (currentCampaign.status === 'draft') {
                    const validation = await api.validateVariables(currentCampaign.id, true);
                    if (!validation.approved) {
                      return validation;
                    }
                  }
                  await sendApi.queue(currentCampaign.id);
                  await load();
                  return { approved: true, items: [] };
                }}
              />
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
