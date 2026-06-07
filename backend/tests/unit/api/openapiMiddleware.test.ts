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
      statusCode: 201,
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

  it('does not validate error responses against success schemas', () => {
    const middleware = validateOpenApi('/contacts', 'post', '201');
    const response = {
      statusCode: 409,
      json: (body: unknown) => body
    };

    middleware({ body: { email: 'valid@example.com', name: 'Valid' } } as never, response as never, () => undefined);

    expect(response.json({
      error: { code: 'duplicate_contact', message: 'Duplicate' }
    })).toEqual({
      error: { code: 'duplicate_contact', message: 'Duplicate' }
    });
  });
});
