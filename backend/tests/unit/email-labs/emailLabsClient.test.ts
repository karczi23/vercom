import { describe, expect, it } from 'vitest';
import { mapCampaignToEmailLabsPayload } from '../../../src/email-labs/emailLabsMapper.js';

describe('EmailLabs mapping', () => {
  it('keeps placeholders untouched and sends recipient variables', () => {
    const payload = mapCampaignToEmailLabsPayload({
      id: 'campaign',
      name: 'Campaign',
      subject: 'Subject',
      templateContent: 'Hi {{ Name }}',
      fallbackVariables: {},
      assignedOperatorId: 'operator',
      status: 'ready'
    }, [{ id: 'contact', email: 'a@example.com', name: 'Anna', personalizationData: {}, validationStatus: 'valid' }]);

    expect(payload.templateContent).toContain('{{ Name }}');
    expect(payload.recipients[0]?.variables.Name).toBe('Anna');
  });
});
