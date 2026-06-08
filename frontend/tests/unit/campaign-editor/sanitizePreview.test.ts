import { describe, expect, it } from 'vitest';
import { sanitizePreviewHtml } from '../../../src/campaign-editor/sanitizePreview.js';

describe('sanitizePreviewHtml', () => {
  it('removes unsafe preview markup', () => {
    const html = sanitizePreviewHtml('<p onclick="x()">Hello<script>alert(1)</script><span style="font-family: Georgia; color: red">A</span></p>');
    expect(html).toContain('font-family: Georgia');
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('script');
    expect(html).not.toContain('color');
  });
});
