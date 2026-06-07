import type { AuthenticatedUser } from '@vercom/common/types/shared';
import type { Campaign } from '@vercom/common/types/mailing-campaigns';
import { ApiError, forbidden, notFound } from '../common/apiErrors.js';
import { canAccessCampaign } from '../auth/authorization.js';
import type { Database } from '../db/client.js';
import { validateCampaignInput, validateCampaignUpdateInput } from './campaignValidation.js';
import type { CampaignRepository } from './campaignRepository.js';
import type { CampaignRecipientRepository } from './campaignRecipientRepository.js';
import { validateRecipientVariables } from './variableValidationService.js';

export class CampaignService {
  constructor(
    private readonly db: Database,
    private readonly campaigns: CampaignRepository,
    private readonly recipients: CampaignRecipientRepository
  ) {}

  list(user: AuthenticatedUser, limit?: number, offset?: number): Promise<Campaign[]> {
    return this.campaigns.list(user, limit, offset);
  }

  async get(user: AuthenticatedUser, id: string): Promise<Campaign> {
    await this.ensureAccess(user, id);
    const campaign = await this.campaigns.findById(id);
    if (!campaign) throw notFound('Campaign was not found');
    return campaign;
  }

  async create(user: AuthenticatedUser, raw: unknown): Promise<Campaign> {
    const input = validateCampaignInput(raw);
    return this.campaigns.create(input, user.id);
  }

  async update(user: AuthenticatedUser, id: string, raw: unknown): Promise<Campaign> {
    const campaign = await this.get(user, id);
    this.requireDraft(campaign);
    const updated = await this.campaigns.update(id, validateCampaignUpdateInput(campaign, raw));
    if (!updated) throw notFound('Campaign was not found');
    return updated;
  }

  async delete(user: AuthenticatedUser, id: string): Promise<void> {
    const campaign = await this.get(user, id);
    this.requireDraft(campaign);
    await this.recipients.deleteRecipients(id);
    if (!(await this.campaigns.delete(id))) throw notFound('Campaign was not found');
  }

  async replaceRecipients(user: AuthenticatedUser, campaignId: string, contactIds: string[]): Promise<void> {
    const campaign = await this.get(user, campaignId);
    this.requireDraft(campaign);
    const uniqueContactIds = [...new Set(contactIds)];
    const accessibleContactCount = await this.recipients.countAccessibleContacts(user, uniqueContactIds);
    if (accessibleContactCount !== uniqueContactIds.length) {
      throw forbidden('Caller cannot select one or more contacts');
    }
    await this.recipients.replaceRecipients(campaignId, contactIds);
  }

  async validateVariables(user: AuthenticatedUser, campaignId: string, approve: boolean) {
    const campaign = await this.get(user, campaignId);
    const recipients = await this.recipients.listRecipientContacts(campaignId);
    const items = validateRecipientVariables(campaign, recipients);
    for (const item of items) {
      await this.recipients.updateVariableValidation(campaignId, item.contactId, item.missingVariables, item.fallbackUsed ? ['fallback'] : []);
    }
    const approved = approve && items.every(item => item.missingVariables.length === 0);
    await this.campaigns.approveVariables(campaignId, approved);
    return { approved, items };
  }

  private async ensureAccess(user: AuthenticatedUser, campaignId: string): Promise<void> {
    if (!(await canAccessCampaign(this.db, user, campaignId))) {
      throw forbidden('Caller cannot access this campaign');
    }
  }

  private requireDraft(campaign: Campaign): void {
    if (campaign.status !== 'draft') {
      throw new ApiError(409, 'campaign_not_editable', 'Only draft campaigns can be modified');
    }
  }
}
