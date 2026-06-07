import type { Campaign } from '@vercom/common/types/mailing-campaigns';
import type { PlaceholderValidationRecipient } from '@vercom/common/types/campaign-editor';
import type { RecipientVariableSource } from './editorRepository.js';

export function validateEditorRecipientVariables(campaign: Campaign, placeholders: string[], recipients: RecipientVariableSource[]): PlaceholderValidationRecipient[] {
  return recipients.map(recipient => {
    const variables: Record<string, string> = {
      name: recipient.name,
      Name: recipient.name,
      email: recipient.email,
      Email: recipient.email,
      ...recipient.personalizationData
    };
    const missingVariables = placeholders.filter(name => !variables[name] && !campaign.fallbackVariables[name]);
    const usesFallbackVariables = placeholders.some(name => !variables[name] && Boolean(campaign.fallbackVariables[name]));
    return {
      contactId: recipient.contactId,
      missingVariables,
      usesFallbackVariables,
      status: missingVariables.length === 0 ? 'valid' : 'missing_variables'
    };
  });
}
