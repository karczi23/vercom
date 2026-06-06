import { describe, expect, it } from 'vitest';
import { validateRecipientVariables } from '../../../src/campaigns/variableValidationService.js';

describe('variable validation', () => {
  it('uses contact fields, personalization data, and fallback variables', () => {
    const items = validateRecipientVariables({
      id: 'campaign',
      name: 'Campaign',
      subject: 'Subject',
      templateContent: 'Hi {{ Name }} {{ company }} {{ plan }}',
      fallbackVariables: { plan: 'Basic' },
      assignedOperatorId: 'operator',
      status: 'draft'
    }, [{ contactId: 'contact', name: 'Anna', email: 'a@example.com', personalizationData: { company: 'ACME' } }]);

    expect(items[0]).toMatchObject({ missingVariables: [], fallbackUsed: true });
  });
});
