import { describe, expect, it } from 'vitest';
import { sanitizeEditorHtml } from '../../../src/campaign-editor/sanitize.service.js';

describe('campaign editor sanitizer', () => {
  it('keeps allowlisted formatting and removes unsafe HTML', () => {
    const result = sanitizeEditorHtml('<p>Hello <strong>Name</strong><script>alert(1)</script><span style="font-family: Arial; color: red">A</span></p>');

    expect(result.sanitizedHtml).toContain('<strong>Name</strong>');
    expect(result.sanitizedHtml).toContain('font-family: Arial');
    expect(result.sanitizedHtml).not.toContain('script');
    expect(result.sanitizedHtml).not.toContain('color');
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
