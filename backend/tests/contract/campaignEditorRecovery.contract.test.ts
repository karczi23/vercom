import { describe, expect, it } from 'vitest';
import { createOpenApiValidators } from '../../src/api/openapi-validation/openapiValidator.js';
import { loadMergedOpenApiDocument } from '../../src/api/openapi-validation/campaignEditorValidation.js';

describe('campaign editor recovery contract', () => {
  const validators = createOpenApiValidators(loadMergedOpenApiDocument());

  it('validates placeholder validation and outcome responses', () => {
    expect(validators.getOperation('/campaigns/{campaignId}/editor/validate', 'post').validateResponseBody?.({
      campaignId: 'campaign-1',
      canSend: false,
      placeholders: ['Name'],
      recipients: [{ contactId: 'contact-1', missingVariables: ['Name'], usesFallbackVariables: false, status: 'missing_variables' }]
    })).toBe(true);

    expect(validators.getOperation('/campaigns/{campaignId}/send-outcomes', 'get').validateResponseBody?.({
      items: [{ campaignId: 'campaign-1', contactId: 'contact-1', contactEmail: 'a@example.com', contactName: 'A', sendStatus: 'uncertain', requiresReview: true, forceResendAllowed: true }]
    })).toBe(true);
  });

  it('requires force resend acknowledgement', () => {
    const operation = validators.getOperation('/campaigns/{campaignId}/recipients/{contactId}/force-resend', 'post', '202');
    expect(operation.validateRequestBody?.({ acknowledgedDuplicateRisk: true })).toBe(true);
    expect(operation.validateRequestBody?.({ acknowledgedDuplicateRisk: false })).toBe(false);
    expect(operation.validateResponseBody?.({ campaignId: 'campaign-1', contactId: 'contact-1', sendJobId: 'job-1', status: 'force_resend_queued' })).toBe(true);
  });
});
