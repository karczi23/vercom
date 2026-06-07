import { describe, expect, it } from 'vitest';
import { validateContactInput } from '../../../src/contacts/contactValidation.js';

describe('contact validation', () => {
  it('normalizes valid contact input', () => {
    expect(validateContactInput({ email: ' USER@Example.COM ', name: 'User' })).toMatchObject({
      email: 'user@example.com',
      name: 'User'
    });
  });

  it('rejects invalid contacts with field guidance', () => {
    expect(() => validateContactInput({ email: 'bad', name: '' })).toThrow('Contact input is invalid');
  });
});
