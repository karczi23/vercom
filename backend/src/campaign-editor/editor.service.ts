import type {
  CampaignEditorInput,
  CampaignPreview,
  PlaceholderValidationResult
} from '@vercom/common/types/campaign-editor';
import type { AuthenticatedUser } from '@vercom/common/types/shared';
import { ApiError, notFound, validationError } from '../common/apiErrors.js';
import type { CampaignRepository } from '../campaigns/campaignRepository.js';
import type { Database } from '../db/client.js';
import { requireCampaignEditorAccess } from './editorAuthorization.js';
import type { EditorRepository } from './editorRepository.js';
import { analyzePlaceholders, extractPlaceholders } from './placeholder.service.js';
import { sanitizeEditorHtml } from './sanitize.service.js';
import { SendRecoveryService } from './send-recovery.service.js';
import { validateEditorRecipientVariables } from './variableValidation.service.js';

export class EditorService {
  private readonly recovery: SendRecoveryService;

  constructor(
    private readonly db: Database,
    private readonly campaigns: CampaignRepository,
    private readonly repository: EditorRepository
  ) {
    this.recovery = new SendRecoveryService(repository);
  }

  async getDraft(user: AuthenticatedUser, campaignId: string) {
    await requireCampaignEditorAccess(this.db, user, campaignId);
    const campaign = await this.campaigns.findById(campaignId);
    if (!campaign) {
      throw notFound('Campaign was not found');
    }
    const draft = await this.repository.getDraft(campaignId, extractPlaceholders(campaign.templateContent));
    if (!draft) {
      throw notFound('Campaign editor draft was not found');
    }
    return draft;
  }

  async saveDraft(user: AuthenticatedUser, campaignId: string, raw: unknown) {
    await requireCampaignEditorAccess(this.db, user, campaignId);
    const campaign = await this.campaigns.findById(campaignId);
    if (!campaign) {
      throw notFound('Campaign was not found');
    }
    if (campaign.status !== 'draft' && campaign.status !== 'ready') {
      throw new ApiError(409, 'campaign_not_editable', 'Only draft or ready campaigns can be edited');
    }

    const input = parseEditorInput(raw);
    const sanitized = sanitizeEditorHtml(input.templateContent);
    const analysis = analyzePlaceholders(sanitized.sanitizedHtml);
    if (analysis.invalidPlaceholders.length > 0) {
      throw validationError('Invalid placeholder syntax', analysis.invalidPlaceholders);
    }
    await this.repository.saveDraft(campaignId, input.topic, sanitized.sanitizedHtml);
    const draft = await this.repository.getDraft(campaignId, analysis.placeholders, sanitized.warnings);
    if (!draft) {
      throw notFound('Campaign editor draft was not found');
    }
    return draft;
  }

  async preview(user: AuthenticatedUser, campaignId: string, raw: unknown): Promise<CampaignPreview> {
    await requireCampaignEditorAccess(this.db, user, campaignId);
    const input = parseEditorInput(raw);
    const sanitized = sanitizeEditorHtml(input.templateContent);
    return {
      sanitizedHtml: sanitized.sanitizedHtml,
      placeholderNames: extractPlaceholders(sanitized.sanitizedHtml),
      warnings: sanitized.warnings
    };
  }

  async validatePlaceholders(user: AuthenticatedUser, campaignId: string): Promise<PlaceholderValidationResult> {
    await requireCampaignEditorAccess(this.db, user, campaignId);
    const campaign = await this.campaigns.findById(campaignId);
    if (!campaign) {
      throw notFound('Campaign was not found');
    }
    const placeholders = extractPlaceholders(campaign.templateContent);
    const recipients = await this.repository.listRecipientVariables(campaignId);
    const items = validateEditorRecipientVariables(campaign, placeholders, recipients);
    for (const item of items) {
      await this.repository.updateRecipientValidation(campaignId, item.contactId, item.missingVariables, item.usesFallbackVariables ? ['fallback'] : []);
    }
    return {
      campaignId,
      placeholders,
      recipients: items,
      canSend: items.every(item => item.status === 'valid')
    };
  }

  async listSendOutcomes(user: AuthenticatedUser, campaignId: string) {
    await requireCampaignEditorAccess(this.db, user, campaignId);
    return { items: await this.recovery.listOutcomes(campaignId) };
  }

  async forceResend(user: AuthenticatedUser, campaignId: string, contactId: string, raw: unknown) {
    await requireCampaignEditorAccess(this.db, user, campaignId);
    const request = parseForceResendRequest(raw);
    return this.recovery.forceResendUncertainRecipient(user, campaignId, contactId, request.acknowledgedDuplicateRisk, request.reason);
  }

  async retryFailed(user: AuthenticatedUser, campaignId: string) {
    await requireCampaignEditorAccess(this.db, user, campaignId);
    return this.recovery.retryFailedRecipients(campaignId);
  }
}

function parseEditorInput(raw: unknown): CampaignEditorInput {
  const input = raw && typeof raw === 'object' ? raw as Partial<CampaignEditorInput> : {};
  if (typeof input.topic !== 'string' || input.topic.trim().length === 0) {
    throw validationError('Topic is required');
  }
  if (typeof input.templateContent !== 'string' || input.templateContent.trim().length === 0) {
    throw validationError('Template content is required');
  }
  return {
    topic: input.topic.trim(),
    templateContent: input.templateContent
  };
}

function parseForceResendRequest(raw: unknown): { acknowledgedDuplicateRisk: true; reason?: string } {
  const input = raw && typeof raw === 'object' ? raw as { acknowledgedDuplicateRisk?: unknown; reason?: unknown } : {};
  if (input.acknowledgedDuplicateRisk !== true) {
    throw validationError('Duplicate-risk acknowledgement is required');
  }
  if (input.reason !== undefined && typeof input.reason !== 'string') {
    throw validationError('Reason must be a string');
  }
  return input.reason ? { acknowledgedDuplicateRisk: true, reason: input.reason } : { acknowledgedDuplicateRisk: true };
}
