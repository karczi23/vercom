import { logger, redactSecrets } from '../common/logger.js';
import type { EmailLabsSendPayload } from './emailLabsMapper.js';

export interface EmailLabsConfig {
  baseUrl: string;
  applicationKey: string;
  authorization: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface EmailLabsResult {
  status: 'submitted' | 'failed' | 'timeout' | 'partial_failure';
  providerRequestId?: string | undefined;
  statusCode?: number | undefined;
  summary?: string | undefined;
  providerMessageIds?: Record<string, string> | undefined;
}

export class EmailLabsClient {
  constructor(private readonly config: EmailLabsConfig) {}

  async send(payload: EmailLabsSendPayload): Promise<EmailLabsResult> {
    const batches = chunk(payload.recipients, 200);
    const results: EmailLabsResult[] = [];

    logger.info('EmailLabs send started', {
      recipientCount: payload.recipients.length,
      batchCount: batches.length,
      smtpAccount: payload.smtpAccount,
      from: payload.from,
      hasTemplateId: Boolean(payload.templateId)
    });

    for (const [index, recipients] of batches.entries()) {
      logger.info('EmailLabs batch submit started', {
        batchNumber: index + 1,
        batchCount: batches.length,
        recipientCount: recipients.length
      });
      results.push(await this.sendBatch({ ...payload, recipients }));
    }

    const providerMessageIds = Object.assign({}, ...results.map(result => result.providerMessageIds ?? {})) as Record<string, string>;
    const failed = results.filter(result => result.status !== 'submitted');
    if (failed.length > 0) {
      return {
        status: failed.length === results.length ? failed[0]!.status : 'partial_failure',
        statusCode: failed[0]?.statusCode,
        summary: failed.map(result => result.summary).filter(Boolean).join('; ') || 'One or more EmailLabs batches failed',
        providerMessageIds
      };
    }

    return {
      status: 'submitted',
      statusCode: results.at(-1)?.statusCode,
      providerRequestId: results.map(result => result.providerRequestId).filter(Boolean).join(',') || undefined,
      summary: results.map(result => result.summary).filter(Boolean).join('; ') || undefined,
      providerMessageIds
    };
  }

  private async sendBatch(payload: EmailLabsSendPayload): Promise<EmailLabsResult> {
    const maxRetries = this.config.maxRetries ?? 2;
    let lastResult: EmailLabsResult | undefined;
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      lastResult = await this.trySendBatch(payload);
      if (lastResult.status === 'submitted' || (lastResult.statusCode && lastResult.statusCode < 500)) {
        return lastResult;
      }
      if (attempt < maxRetries) {
        logger.warn('EmailLabs batch will retry', {
          attempt: attempt + 1,
          maxRetries,
          status: lastResult.status,
          statusCode: lastResult.statusCode,
          summary: lastResult.summary
        });
      }
    }
    return lastResult ?? { status: 'failed', summary: 'EmailLabs request failed before submission' };
  }

  private async trySendBatch(payload: EmailLabsSendPayload): Promise<EmailLabsResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs ?? 10_000);
    try {
      const response = await fetch(`${this.config.baseUrl}/api/sendmail_templates`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${this.config.applicationKey}:${this.config.authorization}`).toString('base64')}`
        },
        body: encodePayload(payload)
      });
      const summary = redactSecrets(await response.text());
      if (!response.ok) {
        logger.warn('EmailLabs batch rejected', {
          statusCode: response.status,
          summary
        });
        return { status: 'failed', statusCode: response.status, summary };
      }
      logger.info('EmailLabs batch submitted', {
        statusCode: response.status,
        requestId: response.headers.get('x-request-id') ?? undefined,
        summary
      });
      return {
        status: 'submitted',
        statusCode: response.status,
        summary,
        providerRequestId: response.headers.get('x-request-id') ?? undefined,
        providerMessageIds: extractProviderMessageIds(summary)
      };
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

function encodePayload(payload: EmailLabsSendPayload): string {
  const body = new URLSearchParams();
  body.set('smtp_account', payload.smtpAccount);
  body.set('from', payload.from);
  body.set('subject', payload.subject);
  if (payload.templateId) {
    body.set('template_id', payload.templateId);
  } else if (payload.templateContent) {
    body.set('html', payload.templateContent);
  }

  for (const recipient of payload.recipients) {
    body.set(`to[${recipient.email}][email]`, recipient.email);
    if (recipient.messageId) {
      body.set(`to[${recipient.email}][message_id]`, recipient.messageId);
    }
    for (const [name, value] of Object.entries(recipient.variables)) {
      body.set(`to[${recipient.email}][vars][${name}]`, value);
    }
  }

  return body.toString();
}

function extractProviderMessageIds(summary: string): Record<string, string> {
  try {
    const parsed = JSON.parse(summary) as unknown;
    return collectProviderMessageIds(parsed);
  } catch {
    return {};
  }
}

function collectProviderMessageIds(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {};
  const result: Record<string, string> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (key.includes('@') && typeof nested === 'string') {
      result[key] = nested;
    } else if (key.includes('@') && nested && typeof nested === 'object' && 'message_id' in nested && typeof nested.message_id === 'string') {
      result[key] = nested.message_id;
    } else {
      Object.assign(result, collectProviderMessageIds(nested));
    }
  }
  return result;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}
