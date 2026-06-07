import { ApiError } from '../common/apiErrors.js';
import type { CampaignRepository } from '../campaigns/campaignRepository.js';
import type { SendJobRepository } from './sendJobRepository.js';

export class SendQueueService {
  constructor(
    private readonly campaigns: CampaignRepository,
    private readonly jobs: SendJobRepository
  ) {}

  async queueCampaign(campaignId: string) {
    const campaign = await this.campaigns.findById(campaignId);
    if (!campaign) throw new ApiError(404, 'not_found', 'Campaign was not found');
    if (campaign.status !== 'ready') throw new ApiError(409, 'campaign_not_ready', 'Campaign variables must be approved before send');
    return this.jobs.enqueue(campaignId);
  }
}
