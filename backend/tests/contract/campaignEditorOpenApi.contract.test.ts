import { describe, expect, it } from 'vitest';
import { createOpenApiValidators } from '../../src/api/openapi-validation/openapiValidator.js';

describe('campaign editor OpenAPI contract', () => {
  it('loads editor schemas from the shared OpenAPI document and validates draft save requests', () => {
    const validators = createOpenApiValidators();
    const operation = validators.getOperation('/campaigns/{campaignId}/editor', 'put');

    expect(operation.validateRequestBody?.({ topic: 'Launch', templateContent: '<p>Hello {{ Name }}</p>' })).toBe(true);
    expect(operation.validateRequestBody?.({ topic: '', templateContent: '<p>Hello</p>' })).toBe(false);
  });
});
