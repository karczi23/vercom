import { describe, expect, it } from 'vitest';
import { extractPlaceholders, findUnsupportedPlaceholders } from '../../../src/campaigns/placeholderService.js';

describe('placeholder service', () => {
  it('extracts supported placeholders', () => {
    expect(extractPlaceholders('Hello {{ Name }} from {{company}}')).toEqual(['Name', 'company']);
  });

  it('detects unsupported placeholders', () => {
    expect(findUnsupportedPlaceholders('Hello {{ Name }} from {{company}}')).toEqual([]);
    expect(findUnsupportedPlaceholders('Hello {Name}')).toEqual(['{Name}']);
    expect(findUnsupportedPlaceholders('Hello {{ missing')).toEqual(['{{ missing']);
  });
});
