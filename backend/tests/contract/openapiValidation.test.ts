import { describe, expect, it } from 'vitest';
import { createOpenApiValidators } from '../../src/api/openapi-validation/openapiValidator.js';

describe('OpenAPI validation', () => {
  it('validates contact input from the OpenAPI contract', () => {
    const validators = createOpenApiValidators();
    const operation = validators.getOperation('/contacts', 'post', '201');

    expect(operation.validateRequestBody?.({ email: 'person@example.com', name: 'Person' })).toBe(true);
    expect(operation.validateRequestBody?.({ email: 'not-an-email' })).toBe(false);
  });
});
