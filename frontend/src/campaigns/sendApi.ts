import type { SendAttempt, SendJob } from '@vercom/common/types/mailing-campaigns';
import type { ApiClient } from '../api/client.js';

export function createSendApi(client: ApiClient) {
  return {
    queue(campaignId: string): Promise<SendJob> {
      return client.request(`/campaigns/${campaignId}/send`, { method: 'POST' });
    },
    attempts(campaignId: string): Promise<{ items: SendAttempt[] }> {
      return client.request(`/campaigns/${campaignId}/send-attempts`);
    }
  };
}
