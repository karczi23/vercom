import { describe, expect, it } from 'vitest';
import { createOpenApiValidators } from '../../src/api/openapi-validation/openapiValidator.js';

describe('send contracts', () => {
  it('defines send job response validation', () => {
    const operation = createOpenApiValidators().getOperation('/campaigns/{campaignId}/send', 'post', '202');
    expect(operation.validateResponseBody?.({ id: 'job', campaignId: 'campaign', status: 'pending' })).toBe(true);
  });
});
