import { EmailLabsClient } from '../email-labs/emailLabsClient.js';
import { mapCampaignToEmailLabsPayload } from '../email-labs/emailLabsMapper.js';
import type { Campaign } from '@vercom/common/types/mailing-campaigns';

export function isSafeToSubmit(sendStatus: string): boolean {
  return sendStatus === 'pending' || sendStatus === 'failed';
}

export class SendWorkerService {
  constructor(private readonly emailLabs: EmailLabsClient) {}

  async submit(campaign: Campaign, contacts: Array<{ id: string; email: string; name: string; personalizationData: Record<string, string> }>) {
    const payload = mapCampaignToEmailLabsPayload(campaign, contacts.map(contact => ({
      id: contact.id,
      email: contact.email,
      name: contact.name,
      personalizationData: contact.personalizationData,
      validationStatus: 'valid'
    })));
    return this.emailLabs.send(payload);
  }
}
