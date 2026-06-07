import { CampaignRepository } from '../campaigns/campaignRepository.js';
import { EditorRepository } from '../campaign-editor/editorRepository.js';
import { EditorService } from '../campaign-editor/editor.service.js';
import type { McpToolContext } from './toolContext.js';

export function createCampaignEditorTools(context: McpToolContext) {
  const service = new EditorService(context.db, new CampaignRepository(context.db), new EditorRepository(context.db));
  return {
    campaign_editor_get_draft: (input: { campaignId: string }) => service.getDraft(context.user, input.campaignId),
    campaign_editor_save_draft: (input: { campaignId: string; topic: string; templateContent: string }) =>
      service.saveDraft(context.user, input.campaignId, input),
    campaign_editor_validate: (input: { campaignId: string }) => service.validatePlaceholders(context.user, input.campaignId),
    campaign_send_outcomes: (input: { campaignId: string }) => service.listSendOutcomes(context.user, input.campaignId),
    campaign_force_resend_uncertain_recipient: (input: { campaignId: string; contactId: string; acknowledgedDuplicateRisk: boolean; reason?: string }) =>
      service.forceResend(context.user, input.campaignId, input.contactId, input)
  };
}
