import DOMPurify from 'dompurify';

const allowedTags = ['strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'p', 'br'];
const allowedFonts = ['Arial', 'Georgia', 'Times New Roman', 'Verdana'];

export function sanitizePreviewHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ['style'],
    ALLOW_DATA_ATTR: false
  }).replace(/<span\s+style="([^"]*)"([^>]*)>/gi, (_match, style: string, rest: string) => {
    const font = allowedFonts.find(item => new RegExp(`font-family\\s*:\\s*['"]?${escapeRegex(item)}['"]?`, 'i').test(style));
    return font ? `<span style="font-family: ${font}"${rest}>` : `<span${rest}>`;
  });
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
