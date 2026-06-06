import { logger, redactSecrets } from '../common/logger.js';
import type { EmailLabsSendPayload } from './emailLabsMapper.js';

export interface EmailLabsConfig {
  baseUrl: string;
  applicationKey: string;
  authorization: string;
  timeoutMs?: number;
}

export interface EmailLabsResult {
  status: 'submitted' | 'failed' | 'timeout';
  providerRequestId?: string | undefined;
  statusCode?: number | undefined;
  summary?: string | undefined;
}

export class EmailLabsClient {
  constructor(private readonly config: EmailLabsConfig) {}

  async send(payload: EmailLabsSendPayload): Promise<EmailLabsResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs ?? 10_000);
    try {
      const response = await fetch(`${this.config.baseUrl}/api/sendmail_templates`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Application-Key': this.config.applicationKey,
          Authorization: this.config.authorization
        },
        body: JSON.stringify(payload)
      });
      const summary = redactSecrets(await response.text());
      if (!response.ok) {
        return { status: 'failed', statusCode: response.status, summary };
      }
      return { status: 'submitted', statusCode: response.status, summary, providerRequestId: response.headers.get('x-request-id') ?? undefined };
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return { status: 'timeout', summary: 'EmailLabs request timed out' };
      }
      logger.warn('EmailLabs request failed gracefully', error);
      return { status: 'failed', summary: redactSecrets(String(error)) };
    } finally {
      clearTimeout(timeout);
    }
  }
}
