import type { Campaign, Contact } from '@vercom/common/types/mailing-campaigns';

export interface EmailLabsRecipient {
  email: string;
  variables: Record<string, string>;
  messageId?: string | undefined;
}

export interface EmailLabsSendPayload {
  smtpAccount: string;
  from: string;
  subject: string;
  templateId?: string | undefined;
  templateContent?: string | undefined;
  recipients: EmailLabsRecipient[];
}

export interface EmailLabsMapperConfig {
  smtpAccount: string;
  from: string;
}

export function mapCampaignToEmailLabsPayload(campaign: Campaign, contacts: Contact[], config: EmailLabsMapperConfig): EmailLabsSendPayload {
  return {
    smtpAccount: config.smtpAccount,
    from: config.from,
    templateId: campaign.emailLabsTemplateId,
    subject: campaign.subject,
    templateContent: campaign.emailLabsTemplateId ? undefined : campaign.templateContent,
    recipients: contacts.map(contact => ({
      email: contact.email,
      messageId: `${campaign.id}-${contact.id}`,
      variables: {
        ...campaign.fallbackVariables,
        Name: contact.name,
        name: contact.name,
        Email: contact.email,
        email: contact.email,
        ...contact.personalizationData
      }
    }))
  };
}
