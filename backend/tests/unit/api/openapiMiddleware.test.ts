import { describe, expect, it } from 'vitest';
import { validateOpenApi } from '../../../src/api/openapiMiddleware.js';

describe('OpenAPI middleware', () => {
  it('rejects request bodies that do not match the OpenAPI contract', () => {
    const middleware = validateOpenApi('/contacts', 'post', '201');
    let error: unknown;

    middleware({ body: { email: 'not-an-email' } } as never, {} as never, nextError => {
      error = nextError;
    });

    expect(error).toMatchObject({ status: 400, code: 'validation_error' });
  });

  it('rejects response bodies that do not match the OpenAPI contract', () => {
    const middleware = validateOpenApi('/contacts', 'post', '201');
    const response = {
      json: (body: unknown) => body
    };

    middleware({ body: { email: 'valid@example.com', name: 'Valid' } } as never, response as never, () => undefined);

    expect(() => response.json({
      id: 'contact',
      email: 'valid@example.com',
      name: 'Valid',
      validationStatus: 'valid'
    })).toThrow('Response does not match OpenAPI schema');
  });
});
