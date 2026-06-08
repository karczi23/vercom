export const ALLOWED_EDITOR_TAGS = ['strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'p', 'br'] as const;
export const ALLOWED_EDITOR_ATTR = ['style'] as const;
export const ALLOWED_FONT_FAMILIES = ['Arial', 'Georgia', 'Times New Roman', 'Verdana'] as const;

export type AllowedFontFamily = typeof ALLOWED_FONT_FAMILIES[number];
