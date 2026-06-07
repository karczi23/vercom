import type { CampaignStatus } from './mailing-campaigns.js';
import type { Identifier } from './shared.js';

export interface CampaignEditorInput {
  topic: string;
  templateContent: string;
}

export interface CampaignEditorDraft extends CampaignEditorInput {
  campaignId: Identifier;
  placeholderNames: string[];
  sanitizationWarnings?: string[] | undefined;
  status: CampaignStatus;
  assignedOperatorId: Identifier;
  updatedAt: string;
}

export interface CampaignPreview {
  sanitizedHtml: string;
  placeholderNames: string[];
  warnings?: string[] | undefined;
}

export interface PlaceholderValidationRecipient {
  contactId: Identifier;
  missingVariables: string[];
  usesFallbackVariables: boolean;
  status: 'valid' | 'missing_variables';
}

export interface PlaceholderValidationResult {
  campaignId: Identifier;
  canSend: boolean;
  placeholders: string[];
  recipients: PlaceholderValidationRecipient[];
}

export type EditorSendStatus = 'pending' | 'submitted' | 'failed' | 'uncertain' | 'force_resend_queued';

export interface RecipientSendOutcome {
  campaignId: Identifier;
  contactId: Identifier;
  contactEmail: string;
  contactName: string;
  sendStatus: EditorSendStatus;
  providerMessageId?: string | undefined;
  lastAttemptAt?: string | undefined;
  failureReason?: string | undefined;
  requiresReview: boolean;
  forceResendAllowed: boolean;
}

export interface SendOutcomeList {
  items: RecipientSendOutcome[];
}

export interface ForceResendRequest {
  acknowledgedDuplicateRisk: true;
  reason?: string | undefined;
}

export interface ForceResendResponse {
  campaignId: Identifier;
  contactId: Identifier;
  sendJobId: Identifier;
  status: 'force_resend_queued';
}
