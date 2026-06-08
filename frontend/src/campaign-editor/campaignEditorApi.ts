import type { ApiClient } from '../api/client.js';
import type {
  CampaignEditorDraft,
  CampaignEditorInput,
  CampaignPreview,
  ForceResendRequest,
  ForceResendResponse,
  PlaceholderValidationResult,
  RetryFailedResponse,
  SendOutcomeList
} from './campaignEditor.types.js';

export function createCampaignEditorApi(client: ApiClient) {
  return {
    getDraft(campaignId: string) {
      return client.request<CampaignEditorDraft>(`/campaigns/${campaignId}/editor`);
    },
    saveDraft(campaignId: string, input: CampaignEditorInput) {
      return client.request<CampaignEditorDraft>(`/campaigns/${campaignId}/editor`, {
        method: 'PUT',
        body: JSON.stringify(input)
      });
    },
    preview(campaignId: string, input: CampaignEditorInput) {
      return client.request<CampaignPreview>(`/campaigns/${campaignId}/editor/preview`, {
        method: 'POST',
        body: JSON.stringify(input)
      });
    },
    validate(campaignId: string) {
      return client.request<PlaceholderValidationResult>(`/campaigns/${campaignId}/editor/validate`, { method: 'POST' });
    },
    sendOutcomes(campaignId: string) {
      return client.request<SendOutcomeList>(`/campaigns/${campaignId}/send-outcomes`);
    },
    forceResend(campaignId: string, contactId: string, input: ForceResendRequest) {
      return client.request<ForceResendResponse>(`/campaigns/${campaignId}/recipients/${contactId}/force-resend`, {
        method: 'POST',
        body: JSON.stringify(input)
      });
    },
    retryFailed(campaignId: string) {
      return client.request<RetryFailedResponse>(`/campaigns/${campaignId}/retry-failed`, {
        method: 'POST'
      });
    }
  };
}
