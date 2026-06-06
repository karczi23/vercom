import React, { useEffect, useMemo, useState } from 'react';
import type { Campaign } from '@vercom/common/types/mailing-campaigns';
import { ApiClient } from '../api/client.js';
import { createCampaignApi } from './campaignApi.js';
import { CampaignForm } from './CampaignForm.js';

interface CampaignsPageProps {
  client?: ApiClient;
}

export function CampaignsPage({ client }: CampaignsPageProps) {
  const api = useMemo(() => createCampaignApi(client ?? new ApiClient()), [client]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState<string>();

  async function load() {
    try {
      setCampaigns((await api.list()).items);
      setError(undefined);
    } catch {
      setError('Sign in to load campaigns.');
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Messaging</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">Campaigns</h2>
      </div>
      {error ? <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">{error}</p> : null}
      <CampaignForm onSubmit={async input => { await api.create(input); await load(); }} />
      <ul className="mt-5 grid gap-3">
        {campaigns.map(campaign => (
          <li className="rounded-md border border-slate-200 px-4 py-3" key={campaign.id}>
            <div className="font-medium text-slate-950">{campaign.name}</div>
            <div className="text-sm text-slate-600">{campaign.status}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
