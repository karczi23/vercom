import { describe, expect, it } from 'vitest';
import type { Campaign } from '@vercom/common/types/mailing-campaigns';
import { validateEditorRecipientVariables } from '../../../src/campaign-editor/variableValidation.service.js';

describe('campaign editor variable validation', () => {
  const campaign: Campaign = {
    id: 'campaign-1',
    name: 'Campaign',
    subject: 'Subject',
    templateContent: '<p>{{ Name }} {{ company }} {{ fallback }}</p>',
    fallbackVariables: { fallback: 'value' },
    assignedOperatorId: 'operator-1',
    status: 'draft'
  };

  it('uses contact fields, personalization data, and fallback variables', () => {
    expect(validateEditorRecipientVariables(campaign, ['Name', 'company', 'fallback'], [{
      contactId: 'contact-1',
      name: 'Alice',
      email: 'a@example.com',
      personalizationData: { company: 'Vercom' },
      missingVariables: [],
      fallbackVariablesUsed: []
    }])).toEqual([{ contactId: 'contact-1', missingVariables: [], usesFallbackVariables: true, status: 'valid' }]);
  });
});
