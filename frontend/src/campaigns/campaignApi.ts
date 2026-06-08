import type { Campaign, CampaignCreateInput, CampaignInput } from '@vercom/common/types/mailing-campaigns';
import type { ApiClient } from '../api/client.js';

export interface VariableValidationItem {
  contactId: string;
  missingVariables: string[];
  fallbackUsed: boolean;
}

export interface VariableValidationResponse {
  approved: boolean;
  items: VariableValidationItem[];
}

export function createCampaignApi(client: ApiClient) {
  return {
    list(options: { assignedEditorId?: string } = {}): Promise<{ items: Campaign[] }> {
      const params = new URLSearchParams();
      if (options.assignedEditorId) {
        params.set('assignedEditorId', options.assignedEditorId);
      }
      return client.request(`/campaigns${params.size > 0 ? `?${params.toString()}` : ''}`);
    },
    create(input: CampaignCreateInput): Promise<Campaign> {
      return client.request('/campaigns', { method: 'POST', body: JSON.stringify(input) });
    },
    update(id: string, input: CampaignInput): Promise<Campaign> {
      return client.request(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(input) });
    },
    recipients(id: string): Promise<{ contactIds: string[] }> {
      return client.request(`/campaigns/${id}/recipients`);
    },
    replaceRecipients(id: string, contactIds: string[]): Promise<void> {
      return client.request(`/campaigns/${id}/recipients`, { method: 'POST', body: JSON.stringify({ contactIds }) });
    },
    validateVariables(id: string, approve: boolean): Promise<VariableValidationResponse> {
      return client.request(`/campaigns/${id}/validate-variables`, { method: 'POST', body: JSON.stringify({ approve }) });
    }
  };
}
