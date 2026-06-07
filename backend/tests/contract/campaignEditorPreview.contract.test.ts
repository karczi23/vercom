import { describe, expect, it } from 'vitest';
import { createOpenApiValidators } from '../../src/api/openapi-validation/openapiValidator.js';
import { loadMergedOpenApiDocument } from '../../src/api/openapi-validation/campaignEditorValidation.js';

describe('campaign editor preview contract', () => {
  it('validates preview request and sanitized response', () => {
    const validators = createOpenApiValidators(loadMergedOpenApiDocument());
    const operation = validators.getOperation('/campaigns/{campaignId}/editor/preview', 'post');

    expect(operation.validateRequestBody?.({ topic: 'Topic', templateContent: '<p>Hello</p>' })).toBe(true);
    expect(operation.validateResponseBody?.({ sanitizedHtml: '<p>Hello</p>', placeholderNames: ['Name'], warnings: [] })).toBe(true);
  });
});
