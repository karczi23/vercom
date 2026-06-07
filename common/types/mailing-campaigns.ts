import type { Identifier, UserRole } from './shared.js';

export interface User {
  id: Identifier;
  username: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInput {
  email: string;
  name: string;
  personalizationData?: Record<string, string>;
}

export interface Contact extends ContactInput {
  id: Identifier;
  owningOperatorId: Identifier;
  validationStatus: 'valid' | 'invalid';
}

export type CampaignStatus = 'draft' | 'ready' | 'sending' | 'sent' | 'failed';

export interface CampaignInput {
  name: string;
  subject: string;
  templateContent: string;
  emailLabsTemplateId?: string | undefined;
  fallbackVariables: Record<string, string>;
  assignedOperatorId: Identifier;
}

export interface Campaign extends CampaignInput {
  id: Identifier;
  status: CampaignStatus;
}

export type VariableStatus = 'pending' | 'valid' | 'missing';
export type RecipientSendStatus = 'pending' | 'submitted' | 'failed' | 'uncertain';

export interface CampaignRecipient {
  id: Identifier;
  campaignId: Identifier;
  contactId: Identifier;
  variableStatus: VariableStatus;
  missingVariables: string[];
  fallbackVariablesUsed: string[];
  sendStatus: RecipientSendStatus;
  providerMessageId?: string | undefined;
}

export interface SendJob {
  id: Identifier;
  campaignId: Identifier;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface SendAttempt {
  id: Identifier;
  campaignId: Identifier;
  status: 'queued' | 'submitted' | 'rejected' | 'timeout' | 'partial_failure' | 'failed';
  providerRequestId?: string | undefined;
  failureReason?: string | undefined;
  createdAt: string;
}
