import { describe, expect, it } from 'vitest';
import { createOpenApiValidators } from '../../src/api/openapi-validation/openapiValidator.js';
import { loadMergedOpenApiDocument } from '../../src/api/openapi-validation/campaignEditorValidation.js';

describe('campaign editor draft contract', () => {
  it('validates get and save draft response bodies', () => {
    const validators = createOpenApiValidators(loadMergedOpenApiDocument());
    const draft = {
      campaignId: 'campaign-1',
      topic: 'Topic',
      templateContent: '<p>Hello</p>',
      placeholderNames: [],
      status: 'draft',
      assignedOperatorId: 'operator-1',
      updatedAt: new Date().toISOString()
    };

    expect(validators.getOperation('/campaigns/{campaignId}/editor', 'get').validateResponseBody?.(draft)).toBe(true);
    expect(validators.getOperation('/campaigns/{campaignId}/editor', 'put').validateResponseBody?.(draft)).toBe(true);
  });
});
