import { describe, expect, it } from 'vitest';
import { createOpenApiValidators } from '../../src/api/openapi-validation/openapiValidator.js';
import { loadMergedOpenApiDocument } from '../../src/api/openapi-validation/campaignEditorValidation.js';

describe('campaign editor OpenAPI delta', () => {
  it('loads editor schemas and validates draft save requests', () => {
    const validators = createOpenApiValidators(loadMergedOpenApiDocument());
    const operation = validators.getOperation('/campaigns/{campaignId}/editor', 'put');

    expect(operation.validateRequestBody?.({ topic: 'Launch', templateContent: '<p>Hello {{ Name }}</p>' })).toBe(true);
    expect(operation.validateRequestBody?.({ topic: '', templateContent: '<p>Hello</p>' })).toBe(false);
  });
});
