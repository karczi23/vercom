import type { Campaign, Contact } from '@vercom/common/types/mailing-campaigns';

export interface EmailLabsRecipient {
  email: string;
  variables: Record<string, string>;
}

export interface EmailLabsSendPayload {
  templateId?: string | undefined;
  subject: string;
  templateContent: string;
  recipients: EmailLabsRecipient[];
}

export function mapCampaignToEmailLabsPayload(campaign: Campaign, contacts: Contact[]): EmailLabsSendPayload {
  return {
    templateId: campaign.emailLabsTemplateId,
    subject: campaign.subject,
    templateContent: campaign.templateContent,
    recipients: contacts.map(contact => ({
      email: contact.email,
      variables: {
        Name: contact.name,
        name: contact.name,
        Email: contact.email,
        email: contact.email,
        ...contact.personalizationData,
        ...campaign.fallbackVariables
      }
    }))
  };
}
