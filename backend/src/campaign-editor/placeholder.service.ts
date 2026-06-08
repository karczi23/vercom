const placeholderPattern = /\{\{\s*([^{}]+?)\s*\}\}/g;

export interface PlaceholderAnalysis {
  placeholders: string[];
  invalidPlaceholders: string[];
}

export function extractPlaceholders(content: string): string[] {
  return analyzePlaceholders(content).placeholders;
}

export function analyzePlaceholders(content: string): PlaceholderAnalysis {
  const placeholders = new Set<string>();
  for (const match of content.matchAll(placeholderPattern)) {
    const name = match[1]?.trim();
    if (name) {
      placeholders.add(name);
    }
  }

  const withoutValid = content.replace(placeholderPattern, '');
  const invalidPlaceholders = [...withoutValid.matchAll(/\{+\s*[^{}\s][^{}]*\}*/g)]
    .map(match => match[0])
    .filter(value => value.includes('{') || value.includes('}'));

  return {
    placeholders: [...placeholders],
    invalidPlaceholders: [...new Set(invalidPlaceholders)]
  };
}
