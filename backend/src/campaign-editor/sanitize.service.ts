import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { ALLOWED_EDITOR_ATTR, ALLOWED_EDITOR_TAGS, ALLOWED_FONT_FAMILIES } from './editorAllowlist.js';

const window = new JSDOM('').window;
const purify = createDOMPurify(window);

export interface SanitizedEditorContent {
  sanitizedHtml: string;
  warnings: string[];
}

export function sanitizeEditorHtml(input: string): SanitizedEditorContent {
  const warnings: string[] = [];
  const sanitizedHtml = purify.sanitize(input, {
    ALLOWED_TAGS: [...ALLOWED_EDITOR_TAGS],
    ALLOWED_ATTR: [...ALLOWED_EDITOR_ATTR],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'svg', 'math'],
    ALLOW_DATA_ATTR: false
  }).replace(/<span\s+style="([^"]*)"([^>]*)>/gi, (_match, style: string, rest: string) => {
    const family = parseAllowedFontFamily(style);
    if (!family) {
      warnings.push('Removed unsupported span style');
      return `<span${rest}>`;
    }
    return `<span style="font-family: ${family}"${rest}>`;
  });

  if (sanitizedHtml !== input) {
    warnings.push('Removed unsupported HTML');
  }

  return {
    sanitizedHtml,
    warnings: [...new Set(warnings)]
  };
}

function parseAllowedFontFamily(style: string): string | undefined {
  const match = /font-family\s*:\s*([^;]+)/i.exec(style);
  if (!match?.[1]) {
    return undefined;
  }
  const normalized = match[1].replaceAll('"', '').replaceAll("'", '').trim();
  return ALLOWED_FONT_FAMILIES.find(font => font.toLowerCase() === normalized.toLowerCase());
}
