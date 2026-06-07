import React, { useEffect, useMemo, useState } from 'react';
import type { Campaign } from '@vercom/common/types/mailing-campaigns';
import { ApiClient } from '../api/client.js';
import { createCampaignApi } from './campaignApi.js';
import { AssignedCampaignSelector } from './AssignedCampaignSelector.js';
import { CampaignForm } from './CampaignForm.js';

interface CampaignsPageProps {
  client?: ApiClient;
  onEditCampaign?: (campaignId: string) => void;
}

export function CampaignsPage({ client, onEditCampaign }: CampaignsPageProps) {
  const api = useMemo(() => createCampaignApi(client ?? new ApiClient()), [client]);
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedEditorId, setSelectedEditorId] = useState<string>();
  const [error, setError] = useState<string>();

  async function load() {
    try {
      const allCampaigns = (await api.list()).items;
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
    void load();
  }, []);

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
      <CampaignForm onSubmit={async input => { await api.create(input); await load(); }} />
      <AssignedCampaignSelector
        campaigns={availableCampaigns}
        selectedEditorId={selectedEditorId}
        visibleCampaignCount={campaigns.length}
        onSelectEditor={editorId => { void selectEditor(editorId); }}
      />
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
          </li>
        ))}
      </ul>
    </section>
  );
}
