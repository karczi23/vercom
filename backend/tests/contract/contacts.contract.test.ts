import { describe, expect, it } from 'vitest';
import { createOpenApiValidators } from '../../src/api/openapi-validation/openapiValidator.js';

describe('contact contracts', () => {
  it('requires email and name for contact creation', () => {
    const operation = createOpenApiValidators().getOperation('/contacts', 'post', '201');

    expect(operation.validateRequestBody?.({ email: 'valid@example.com', name: 'Valid' })).toBe(true);
    expect(operation.validateRequestBody?.({ email: 'valid@example.com' })).toBe(false);
  });

  it('requires contact responses to include owning operator identity', () => {
    const operation = createOpenApiValidators().getOperation('/contacts', 'post', '201');

    expect(operation.validateResponseBody?.({
      id: 'contact',
      owningOperatorId: 'operator',
      email: 'valid@example.com',
      name: 'Valid',
      validationStatus: 'valid'
    })).toBe(true);
    expect(operation.validateResponseBody?.({
      id: 'contact',
      email: 'valid@example.com',
      name: 'Valid',
      validationStatus: 'valid'
    })).toBe(false);
  });
});
