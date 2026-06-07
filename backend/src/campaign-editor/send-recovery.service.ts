import type { AuthenticatedUser } from '@vercom/common/types/shared';
import { ApiError, validationError } from '../common/apiErrors.js';
import type { EditorRepository } from './editorRepository.js';

export class SendRecoveryService {
  constructor(private readonly repository: EditorRepository) {}

  listOutcomes(campaignId: string) {
    return this.repository.listSendOutcomes(campaignId);
  }

  async forceResendUncertainRecipient(
    user: AuthenticatedUser,
    campaignId: string,
    contactId: string,
    acknowledgedDuplicateRisk: boolean,
    reason?: string
  ) {
    if (acknowledgedDuplicateRisk !== true) {
      throw validationError('Duplicate-risk acknowledgement is required');
    }

    const outcomes = await this.repository.listSendOutcomes(campaignId);
    const outcome = outcomes.find(item => item.contactId === contactId);
    if (!outcome || outcome.sendStatus !== 'uncertain' || !outcome.forceResendAllowed) {
      throw new ApiError(409, 'force_resend_not_allowed', 'Recipient is not in an uncertain state');
    }

    return this.repository.queueForceResend(campaignId, contactId, user.id, reason);
  }

  async retryFailedRecipients(campaignId: string) {
    const outcomes = await this.repository.listSendOutcomes(campaignId);
    if (!outcomes.some(item => item.sendStatus === 'failed' && item.retryFailedAllowed)) {
      throw new ApiError(409, 'retry_failed_not_allowed', 'Campaign has no failed recipients to retry');
    }

    return this.repository.queueFailedRetry(campaignId);
  }
}
