const supportedPlaceholderPattern = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g;
const anyBracePattern = /\{[^{}]*\}|\{\{[^{}]*$/g;

export function extractPlaceholders(templateContent: string): string[] {
  const names = new Set<string>();
  for (const match of templateContent.matchAll(supportedPlaceholderPattern)) {
    names.add(match[1]!);
  }
  return [...names];
}

export function findUnsupportedPlaceholders(templateContent: string): string[] {
  const supported = new Set([...templateContent.matchAll(supportedPlaceholderPattern)].map(match => match[0]));
  return [...templateContent.matchAll(anyBracePattern)]
    .map(match => match[0])
    .filter(token => !supported.has(token));
}
