import { describe, expect, it } from 'vitest';
import { createOpenApiValidators } from '../../src/api/openapi-validation/openapiValidator.js';

describe('campaign contracts', () => {
  it('validates campaign input from OpenAPI', () => {
    const validators = createOpenApiValidators();
    const operation = validators.getOperation('/campaigns', 'post', '201');
    expect(operation.validateRequestBody?.({
      name: 'Campaign',
      subject: 'Subject',
      templateContent: 'Hi {{ Name }}',
      fallbackVariables: {}
    })).toBe(true);
    expect(operation.validateRequestBody?.({ name: 'Campaign' })).toBe(false);
    expect(validators.getOperation('/campaigns/{campaignId}/recipients', 'get').validateResponseBody?.({
      contactIds: ['contact-1']
    })).toBe(true);
  });
});
