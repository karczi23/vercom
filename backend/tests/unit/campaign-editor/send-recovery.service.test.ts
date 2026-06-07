import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../src/common/apiErrors.js';
import { SendRecoveryService } from '../../../src/campaign-editor/send-recovery.service.js';

describe('send recovery service', () => {
  it('queues force resend only for uncertain recipients with acknowledgement', async () => {
    const repository = {
      listSendOutcomes: vi.fn().mockResolvedValue([{ campaignId: 'campaign-1', contactId: 'contact-1', contactEmail: 'a@example.com', contactName: 'A', sendStatus: 'uncertain', requiresReview: true, forceResendAllowed: true, retryFailedAllowed: false }]),
      queueForceResend: vi.fn().mockResolvedValue({ campaignId: 'campaign-1', contactId: 'contact-1', sendJobId: 'job-1', status: 'force_resend_queued' })
    };
    const service = new SendRecoveryService(repository as never);

    await expect(service.forceResendUncertainRecipient({ id: 'operator-1', username: 'op', role: 'operator' }, 'campaign-1', 'contact-1', true)).resolves.toMatchObject({ sendJobId: 'job-1' });
    expect(repository.queueForceResend).toHaveBeenCalledOnce();
  });

  it('rejects submitted recipients', async () => {
    const service = new SendRecoveryService({
      listSendOutcomes: vi.fn().mockResolvedValue([{ contactId: 'contact-1', sendStatus: 'submitted', forceResendAllowed: false, retryFailedAllowed: false }])
    } as never);

    await expect(service.forceResendUncertainRecipient({ id: 'operator-1', username: 'op', role: 'operator' }, 'campaign-1', 'contact-1', true)).rejects.toBeInstanceOf(ApiError);
  });

  it('queues retry when failed recipients are present', async () => {
    const repository = {
      listSendOutcomes: vi.fn().mockResolvedValue([{ campaignId: 'campaign-1', contactId: 'contact-1', contactEmail: 'a@example.com', contactName: 'A', sendStatus: 'failed', requiresReview: false, forceResendAllowed: false, retryFailedAllowed: true }]),
      queueFailedRetry: vi.fn().mockResolvedValue({ campaignId: 'campaign-1', sendJobId: 'job-1', status: 'retry_failed_queued' })
    };
    const service = new SendRecoveryService(repository as never);

    await expect(service.retryFailedRecipients('campaign-1')).resolves.toMatchObject({ sendJobId: 'job-1' });
    expect(repository.queueFailedRetry).toHaveBeenCalledWith('campaign-1');
  });

  it('rejects retry when no failed recipients are present', async () => {
    const service = new SendRecoveryService({
      listSendOutcomes: vi.fn().mockResolvedValue([{ contactId: 'contact-1', sendStatus: 'submitted', forceResendAllowed: false, retryFailedAllowed: false }])
    } as never);

    await expect(service.retryFailedRecipients('campaign-1')).rejects.toBeInstanceOf(ApiError);
  });
});
