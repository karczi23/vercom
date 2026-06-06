import { CampaignRepository } from '../campaigns/campaignRepository.js';
import { SendAttemptRepository } from '../worker/sendAttemptRepository.js';
import { SendJobRepository } from '../worker/sendJobRepository.js';
import { SendQueueService } from '../worker/sendQueueService.js';
import type { McpToolContext } from './toolContext.js';

export function createSendTools(context: McpToolContext) {
  const queue = new SendQueueService(new CampaignRepository(context.db), new SendJobRepository(context.db));
  const attempts = new SendAttemptRepository(context.db);
  return {
    'campaigns.send': (input: { id: string }) => queue.queueCampaign(input.id),
    'campaigns.sendStatus': (input: { id: string }) => attempts.listForCampaign(input.id)
  };
}
