import { CampaignRecipientRepository } from '../campaigns/campaignRecipientRepository.js';
import { CampaignRepository } from '../campaigns/campaignRepository.js';
import { CampaignService } from '../campaigns/campaignService.js';
import type { McpToolContext } from './toolContext.js';

export function createCampaignTools(context: McpToolContext) {
  const service = new CampaignService(context.db, new CampaignRepository(context.db), new CampaignRecipientRepository(context.db));
  return {
    'campaigns.list': (input: { limit?: number; offset?: number }) => service.list(context.user, input.limit, input.offset),
    'campaigns.create': (input: unknown) => service.create(context.user, input),
    'campaigns.update': (input: { id: string; [key: string]: unknown }) => service.update(context.user, input.id, input),
    'campaigns.validateVariables': (input: { id: string; approve?: boolean }) => service.validateVariables(context.user, input.id, Boolean(input.approve))
  };
}
