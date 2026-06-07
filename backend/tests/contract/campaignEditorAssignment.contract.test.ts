import { describe, expect, it } from 'vitest';
import { loadOpenApiDocument } from '../../src/api/openapi-validation/openapiValidator.js';

describe('campaign assignment filter contract', () => {
  it('documents assignedEditorId on the campaign list endpoint', () => {
    const document = loadOpenApiDocument();
    const operation = ((document.paths as Record<string, Record<string, unknown>>)['/campaigns']?.get ?? {}) as {
      parameters?: Array<{ name?: string; in?: string; schema?: { type?: string } }>;
    };

    expect(operation.parameters).toContainEqual(expect.objectContaining({
      name: 'assignedEditorId',
      in: 'query',
      schema: expect.objectContaining({ type: 'string' })
    }));
  });
});
