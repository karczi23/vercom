import { EmailLabsClient } from '../email-labs/emailLabsClient.js';
import { mapCampaignToEmailLabsPayload } from '../email-labs/emailLabsMapper.js';
import type { Campaign } from '@vercom/common/types/mailing-campaigns';
import { logger } from '../common/logger.js';
import type { CampaignRepository } from '../campaigns/campaignRepository.js';
import type { CampaignRecipientRepository } from '../campaigns/campaignRecipientRepository.js';
import type { SendAttemptRepository } from './sendAttemptRepository.js';
import type { SendJobRepository } from './sendJobRepository.js';

export function isSafeToSubmit(sendStatus: string): boolean {
  return sendStatus === 'pending' || sendStatus === 'failed';
}

export class SendWorkerService {
  constructor(
    private readonly emailLabs: EmailLabsClient,
    private readonly deliveryConfig = { smtpAccount: 'test.smtp', from: 'sender@example.com' },
    private readonly campaigns?: CampaignRepository,
    private readonly recipients?: CampaignRecipientRepository,
    private readonly jobs?: SendJobRepository,
    private readonly attempts?: SendAttemptRepository
  ) {}

  async submit(campaign: Campaign, contacts: Array<{ id: string; email: string; name: string; personalizationData: Record<string, string> }>) {
    const contactModels = contacts.map(contact => ({
      id: contact.id,
      owningOperatorId: campaign.assignedOperatorId,
      email: contact.email,
      name: contact.name,
      personalizationData: contact.personalizationData,
      validationStatus: 'valid'
    } as const));
    const payload = mapCampaignToEmailLabsPayload(campaign, contactModels, this.deliveryConfig);
    const result = await this.emailLabs.send(payload);
    return {
      ...result,
      recipientOutcomes: contacts.map(contact => ({
        contactId: contact.id,
        email: contact.email,
        providerMessageId: result.providerMessageIds?.[contact.email]
      }))
    };
  }

  async processNext(workerId: string): Promise<boolean> {
    if (!this.campaigns || !this.recipients || !this.jobs || !this.attempts) {
      throw new Error('Worker repositories are required to process queued jobs');
    }
    const job = await this.jobs.claimPending(workerId);
    if (!job) return false;

    logger.info('Send job claimed', {
      workerId,
      jobId: job.id,
      campaignId: job.campaignId
    });

    try {
      const campaign = await this.campaigns.findById(job.campaignId);
      if (!campaign) throw new Error(`Campaign ${job.campaignId} was not found`);
      await this.campaigns.markStatus(campaign.id, 'sending');
      logger.info('Campaign marked as sending', {
        jobId: job.id,
        campaignId: campaign.id,
        campaignName: campaign.name
      });
      const recipientContacts = await this.recipients.listRecipientContacts(campaign.id);
      const safeRecipientContacts = recipientContacts.filter(contact => isSafeToSubmit(contact.sendStatus));
      logger.info('Campaign recipients loaded for send', {
        jobId: job.id,
        campaignId: campaign.id,
        recipientCount: safeRecipientContacts.length,
        skippedRecipientCount: recipientContacts.length - safeRecipientContacts.length
      });
      if (safeRecipientContacts.length === 0) {
        await this.jobs.mark(job.id, 'completed');
        await this.campaigns.markStatus(campaign.id, campaign.status);
        logger.info('Send job finished with no safe recipients', {
          jobId: job.id,
          campaignId: campaign.id
        });
        return true;
      }
      const result = await this.submit(campaign, safeRecipientContacts.map(contact => ({
        id: contact.contactId,
        email: contact.email,
        name: contact.name,
        personalizationData: contact.personalizationData
      })));
      logger.info('Campaign send provider result received', {
        jobId: job.id,
        campaignId: campaign.id,
        status: result.status,
        statusCode: result.statusCode,
        providerRequestId: result.providerRequestId,
        summary: result.summary
      });
      await this.attempts.record({
        campaignId: campaign.id,
        sendJobId: job.id,
        status: result.status === 'submitted' ? 'submitted' : result.status === 'timeout' ? 'timeout' : result.status === 'partial_failure' ? 'partial_failure' : 'failed',
        providerRequestId: result.providerRequestId,
        providerStatusCode: result.statusCode,
        providerResponseSummary: result.summary,
        failureReason: result.status === 'submitted' ? undefined : result.summary
      });
      logger.info('Send attempt recorded', {
        jobId: job.id,
        campaignId: campaign.id,
        status: result.status,
        statusCode: result.statusCode
      });
      for (const outcome of result.recipientOutcomes) {
        await this.recipients.updateSendOutcome(
          campaign.id,
          outcome.contactId,
          outcome.providerMessageId ? 'submitted' : result.status === 'submitted' ? 'submitted' : result.status === 'timeout' ? 'uncertain' : 'failed',
          outcome.providerMessageId
        );
      }
      await this.jobs.mark(job.id, result.status === 'submitted' ? 'completed' : 'failed', result.status === 'submitted' ? undefined : result.summary);
      await this.campaigns.markStatus(campaign.id, result.status === 'submitted' ? 'sent' : 'failed');
      logger.info('Send job finished', {
        jobId: job.id,
        campaignId: campaign.id,
        jobStatus: result.status === 'submitted' ? 'completed' : 'failed',
        campaignStatus: result.status === 'submitted' ? 'sent' : 'failed'
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Send job failed with exception', {
        jobId: job.id,
        campaignId: job.campaignId,
        message
      });
      await this.jobs.mark(job.id, 'failed', message);
      await this.attempts.record({
        campaignId: job.campaignId,
        sendJobId: job.id,
        status: 'failed',
        failureReason: message
      });
      return true;
    }
  }
}
