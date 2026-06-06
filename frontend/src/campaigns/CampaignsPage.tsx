import React, { useEffect, useMemo, useState } from 'react';
import type { Campaign } from '@vercom/common/types/mailing-campaigns';
import { ApiClient } from '../api/client.js';
import { createCampaignApi } from './campaignApi.js';
import { CampaignForm } from './CampaignForm.js';

export function CampaignsPage() {
  const api = useMemo(() => createCampaignApi(new ApiClient()), []);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  async function load() {
    setCampaigns((await api.list()).items);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section>
      <h1>Campaigns</h1>
      <CampaignForm onSubmit={async input => { await api.create(input); await load(); }} />
      <ul>
        {campaigns.map(campaign => <li key={campaign.id}>{campaign.name} - {campaign.status}</li>)}
      </ul>
    </section>
  );
}
