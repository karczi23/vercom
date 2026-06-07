import { describe, expect, it } from 'vitest';
import { analyzePlaceholders, extractPlaceholders } from '../../../src/campaign-editor/placeholder.service.js';

describe('campaign editor placeholders', () => {
  it('extracts unique syntactically valid placeholders', () => {
    expect(extractPlaceholders('Hello {{ Name }} from {{ company }} and {{Name}}')).toEqual(['Name', 'company']);
  });

  it('reports invalid placeholder-looking syntax', () => {
    expect(analyzePlaceholders('Hello {Name} and {{ missing')).toMatchObject({
      placeholders: [],
      invalidPlaceholders: ['{Name}', '{{ missing']
    });
  });
});
