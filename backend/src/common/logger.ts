const SECRET_PATTERNS = [/Application-Key:\s*\S+/gi, /Authorization:\s*\S+/gi, /Bearer\s+\S+/gi];

export function redactSecrets(value: string): string {
  return SECRET_PATTERNS.reduce((next, pattern) => next.replace(pattern, '[redacted]'), value);
}

function redactMeta(value: unknown): unknown {
  if (typeof value === 'string') return redactSecrets(value);
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactSecrets(value.message),
      stack: value.stack ? redactSecrets(value.stack) : undefined
    };
  }
  if (Array.isArray(value)) return value.map(redactMeta);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, redactMeta(nested)]));
  }
  return value;
}

export const logger = {
  info(message: string, meta?: unknown): void {
    console.info(redactSecrets(message), meta === undefined ? '' : redactMeta(meta));
  },
  warn(message: string, meta?: unknown): void {
    console.warn(redactSecrets(message), meta === undefined ? '' : redactMeta(meta));
  },
  error(message: string, meta?: unknown): void {
    console.error(redactSecrets(message), meta === undefined ? '' : redactMeta(meta));
  }
};
