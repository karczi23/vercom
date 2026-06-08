import { describe, expect, it } from 'vitest';
import { SendWorkerService } from '../../../src/worker/sendWorkerService.js';

describe('send worker', () => {
  it('submits mapped campaign payload through EmailLabs client', async () => {
    const service = new SendWorkerService({ send: async () => ({ status: 'submitted' }) } as never);
    const result = await service.submit({
      id: 'campaign',
      name: 'Campaign',
      subject: 'Subject',
      templateContent: 'Hi {{ Name }}',
      fallbackVariables: {},
      assignedOperatorId: 'operator',
      status: 'ready'
    }, [{ id: 'contact', email: 'a@example.com', name: 'Anna', personalizationData: {} }]);

    expect(result.status).toBe('submitted');
  });

  it('claims queued jobs and records recipient outcomes', async () => {
    const markedJobs: Array<{ id: string; status: string }> = [];
    const markedCampaigns: string[] = [];
    const attempts: unknown[] = [];
    const outcomes: Array<{ contactId: string; status: string; providerMessageId?: string }> = [];
    const service = new SendWorkerService(
      { send: async () => ({ status: 'submitted', providerMessageIds: { 'a@example.com': 'provider-id' } }) } as never,
      { smtpAccount: 'smtp', from: 'sender@example.com' },
      {
        findById: async () => ({
          id: 'campaign',
          name: 'Campaign',
          subject: 'Subject',
          templateContent: 'Hi {{ Name }}',
          fallbackVariables: {},
          assignedOperatorId: 'operator',
          status: 'ready'
        }),
        markStatus: async (_id: string, status: string) => {
          markedCampaigns.push(status);
        }
      } as never,
      {
        listRecipientContacts: async () => [{
          contactId: 'contact',
          email: 'a@example.com',
          name: 'Anna',
          personalizationData: {},
          sendStatus: 'pending'
        }],
        updateSendOutcome: async (_campaignId: string, contactId: string, status: string, providerMessageId?: string) => {
          outcomes.push(providerMessageId ? { contactId, status, providerMessageId } : { contactId, status });
        }
      } as never,
      {
        claimPending: async () => ({ id: 'job', campaignId: 'campaign', status: 'processing' }),
        mark: async (id: string, status: string) => {
          markedJobs.push({ id, status });
        }
      } as never,
      {
        record: async (attempt: unknown) => {
          attempts.push(attempt);
        }
      } as never
    );

    await expect(service.processNext('worker')).resolves.toBe(true);
    expect(markedJobs).toContainEqual({ id: 'job', status: 'completed' });
    expect(markedCampaigns).toEqual(['sending', 'sent']);
    expect(attempts).toHaveLength(1);
    expect(outcomes).toEqual([{ contactId: 'contact', status: 'submitted', providerMessageId: 'provider-id' }]);
  });

  it('only submits recipients that are safe to retry', async () => {
    const submittedEmails: string[] = [];
    const service = new SendWorkerService(
      {
        send: async (payload: { recipients: Array<{ email: string }> }) => {
          submittedEmails.push(...payload.recipients.map(recipient => recipient.email));
          return { status: 'submitted' };
        }
      } as never,
      { smtpAccount: 'smtp', from: 'sender@example.com' },
      {
        findById: async () => ({
          id: 'campaign',
          name: 'Campaign',
          subject: 'Subject',
          templateContent: 'Hi',
          fallbackVariables: {},
          assignedOperatorId: 'operator',
          status: 'failed'
        }),
        markStatus: async () => {}
      } as never,
      {
        listRecipientContacts: async () => [
          { contactId: 'failed-contact', email: 'failed@example.com', name: 'Failed', personalizationData: {}, sendStatus: 'failed' },
          { contactId: 'submitted-contact', email: 'sent@example.com', name: 'Sent', personalizationData: {}, sendStatus: 'submitted' },
          { contactId: 'uncertain-contact', email: 'unknown@example.com', name: 'Unknown', personalizationData: {}, sendStatus: 'uncertain' }
        ],
        updateSendOutcome: async () => {}
      } as never,
      {
        claimPending: async () => ({ id: 'job', campaignId: 'campaign', status: 'processing' }),
        mark: async () => {}
      } as never,
      {
        record: async () => {}
      } as never
    );

    await service.processNext('worker');

    expect(submittedEmails).toEqual(['failed@example.com']);
  });
});
