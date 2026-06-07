import { and, desc, eq } from 'drizzle-orm';
import type {
  CampaignEditorDraft,
  ForceResendResponse,
  RecipientSendOutcome
} from '@vercom/common/types/campaign-editor';
import type { Database } from '../db/client.js';
import {
  campaignRecipients,
  campaigns,
  contacts,
  forceResendAcknowledgements,
  sendAttempts,
  sendJobs
} from '../db/schema.js';

export interface RecipientVariableSource {
  contactId: string;
  name: string;
  email: string;
  personalizationData: Record<string, string>;
  missingVariables: string[];
  fallbackVariablesUsed: string[];
}

export class EditorRepository {
  constructor(private readonly db: Database) {}

  async getDraft(campaignId: string, placeholderNames: string[], warnings: string[] = []): Promise<CampaignEditorDraft | undefined> {
    const rows = await this.db.select().from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
    const row = rows[0];
    if (!row) {
      return undefined;
    }
    return {
      campaignId: row.id,
      topic: row.subject,
      templateContent: row.templateContent,
      placeholderNames,
      sanitizationWarnings: warnings,
      status: row.status,
      assignedOperatorId: row.assignedOperatorId,
      updatedAt: row.updatedAt.toISOString()
    };
  }

  async saveDraft(campaignId: string, topic: string, templateContent: string): Promise<void> {
    await this.db.update(campaigns)
      .set({ subject: topic, templateContent, updatedAt: new Date(), variableValidationApproved: false, status: 'draft' })
      .where(eq(campaigns.id, campaignId));
  }

  async listRecipientVariables(campaignId: string): Promise<RecipientVariableSource[]> {
    const rows = await this.db
      .select({
        contactId: contacts.id,
        name: contacts.name,
        email: contacts.email,
        personalizationData: contacts.personalizationData,
        missingVariables: campaignRecipients.missingVariables,
        fallbackVariablesUsed: campaignRecipients.fallbackVariablesUsed
      })
      .from(campaignRecipients)
      .innerJoin(contacts, eq(campaignRecipients.contactId, contacts.id))
      .where(eq(campaignRecipients.campaignId, campaignId));

    return rows;
  }

  async updateRecipientValidation(campaignId: string, contactId: string, missingVariables: string[], fallbackVariablesUsed: string[]): Promise<void> {
    await this.db.update(campaignRecipients)
      .set({
        missingVariables,
        fallbackVariablesUsed,
        variableStatus: missingVariables.length === 0 ? 'valid' : 'missing',
        updatedAt: new Date()
      })
      .where(and(eq(campaignRecipients.campaignId, campaignId), eq(campaignRecipients.contactId, contactId)));
  }

  async listSendOutcomes(campaignId: string): Promise<RecipientSendOutcome[]> {
    const rows = await this.db
      .select({
        contactId: contacts.id,
        contactEmail: contacts.email,
        contactName: contacts.name,
        sendStatus: campaignRecipients.sendStatus,
        providerMessageId: campaignRecipients.providerMessageId
      })
      .from(campaignRecipients)
      .innerJoin(contacts, eq(campaignRecipients.contactId, contacts.id))
      .where(eq(campaignRecipients.campaignId, campaignId));

    const attempts = await this.db.select()
      .from(sendAttempts)
      .where(eq(sendAttempts.campaignId, campaignId))
      .orderBy(desc(sendAttempts.createdAt))
      .limit(1);
    const latestAttempt = attempts[0];
    const acknowledgements = await this.db.select({
      contactId: forceResendAcknowledgements.contactId,
      sendJobId: forceResendAcknowledgements.sendJobId
    }).from(forceResendAcknowledgements).where(eq(forceResendAcknowledgements.campaignId, campaignId));
    const acknowledged = new Map(acknowledgements.map(item => [item.contactId, item.sendJobId]));

    return rows.map(row => {
      const queued = acknowledged.has(row.contactId);
      const sendStatus = queued ? 'force_resend_queued' : row.sendStatus;
      const outcome: RecipientSendOutcome = {
        campaignId,
        contactId: row.contactId,
        contactEmail: row.contactEmail,
        contactName: row.contactName,
        sendStatus,
        requiresReview: sendStatus === 'uncertain',
        forceResendAllowed: sendStatus === 'uncertain'
      };
      if (row.providerMessageId) {
        outcome.providerMessageId = row.providerMessageId;
      }
      if (latestAttempt) {
        outcome.lastAttemptAt = latestAttempt.createdAt.toISOString();
      }
      if (latestAttempt?.failureReason) {
        outcome.failureReason = latestAttempt.failureReason;
      }
      return outcome;
    });
  }

  async queueForceResend(campaignId: string, contactId: string, acknowledgedByUserId: string, reason?: string): Promise<ForceResendResponse> {
    const jobs = await this.db.insert(sendJobs).values({ campaignId }).returning({ id: sendJobs.id });
    const sendJobId = jobs[0]!.id;
    await this.db.insert(forceResendAcknowledgements).values({
      campaignId,
      contactId,
      acknowledgedByUserId,
      acknowledgedDuplicateRisk: true,
      reason,
      sendJobId
    });
    return { campaignId, contactId, sendJobId, status: 'force_resend_queued' };
  }
}
