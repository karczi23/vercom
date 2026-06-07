import { EmailLabsClient } from '../email-labs/emailLabsClient.js';
import { mapCampaignToEmailLabsPayload } from '../email-labs/emailLabsMapper.js';
import type { Campaign } from '@vercom/common/types/mailing-campaigns';

export function isSafeToSubmit(sendStatus: string): boolean {
  return sendStatus === 'pending' || sendStatus === 'failed';
}

export class SendWorkerService {
  constructor(
    private readonly emailLabs: EmailLabsClient,
    private readonly deliveryConfig = { smtpAccount: 'test.smtp', from: 'sender@example.com' }
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
}
