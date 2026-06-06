const SECRET_PATTERNS = [/Application-Key:\s*\S+/gi, /Authorization:\s*\S+/gi, /Bearer\s+\S+/gi];

export function redactSecrets(value: string): string {
  return SECRET_PATTERNS.reduce((next, pattern) => next.replace(pattern, '[redacted]'), value);
}

export const logger = {
  info(message: string, meta?: unknown): void {
    console.info(redactSecrets(message), meta ?? '');
  },
  warn(message: string, meta?: unknown): void {
    console.warn(redactSecrets(message), meta ?? '');
  },
  error(message: string, meta?: unknown): void {
    console.error(redactSecrets(message), meta ?? '');
  }
};
