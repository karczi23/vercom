const supportedPlaceholderPattern = /\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g;
const unsupportedDoubleBracePattern = /\{\{[^{}]*$/g;
const singleBracePattern = /\{(?!\{)[^{}]*\}/g;

export function extractPlaceholders(templateContent: string): string[] {
  const names = new Set<string>();
  for (const match of templateContent.matchAll(supportedPlaceholderPattern)) {
    names.add(match[1]!);
  }
  return [...names];
}

export function findUnsupportedPlaceholders(templateContent: string): string[] {
  const withoutSupported = templateContent.replace(supportedPlaceholderPattern, '');
  return [
    ...[...withoutSupported.matchAll(singleBracePattern)].map(match => match[0]),
    ...[...withoutSupported.matchAll(unsupportedDoubleBracePattern)].map(match => match[0])
  ];
}
