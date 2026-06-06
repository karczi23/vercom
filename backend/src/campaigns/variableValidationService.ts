import type { Campaign } from '@vercom/common/types/mailing-campaigns';
import { extractPlaceholders } from './placeholderService.js';

interface RecipientVariableInput {
  contactId: string;
  name: string;
  email: string;
  personalizationData: Record<string, string>;
}

export interface VariableValidationItem {
  contactId: string;
  missingVariables: string[];
  fallbackUsed: boolean;
}

export function validateRecipientVariables(campaign: Campaign, recipients: RecipientVariableInput[]): VariableValidationItem[] {
  const placeholders = extractPlaceholders(campaign.templateContent);
  return recipients.map(recipient => {
    const variables: Record<string, string> = {
      name: recipient.name,
      Name: recipient.name,
      email: recipient.email,
      Email: recipient.email,
      ...recipient.personalizationData
    };
    const missingVariables = placeholders.filter(name => !variables[name] && !campaign.fallbackVariables[name]);
    const fallbackUsed = placeholders.some(name => !variables[name] && Boolean(campaign.fallbackVariables[name]));
    return { contactId: recipient.contactId, missingVariables, fallbackUsed };
  });
}
