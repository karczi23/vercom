import type { Campaign, CampaignInput } from '@vercom/common/types/mailing-campaigns';
import type { ApiClient } from '../api/client.js';

export function createCampaignApi(client: ApiClient) {
  return {
    list(): Promise<{ items: Campaign[] }> {
      return client.request('/campaigns');
    },
    create(input: CampaignInput): Promise<Campaign> {
      return client.request('/campaigns', { method: 'POST', body: JSON.stringify(input) });
    },
    update(id: string, input: CampaignInput): Promise<Campaign> {
      return client.request(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
    },
    replaceRecipients(id: string, contactIds: string[]): Promise<void> {
      return client.request(`/campaigns/${id}/recipients`, { method: 'POST', body: JSON.stringify({ contactIds }) });
    },
    validateVariables(id: string, approve: boolean): Promise<unknown> {
      return client.request(`/campaigns/${id}/validate-variables`, { method: 'POST', body: JSON.stringify({ approve }) });
    }
  };
}
