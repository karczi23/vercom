import { afterEach, describe, expect, it, vi } from 'vitest';
import { EmailLabsClient } from '../../../src/email-labs/emailLabsClient.js';
import { mapCampaignToEmailLabsPayload } from '../../../src/email-labs/emailLabsMapper.js';

describe('EmailLabs mapping', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps placeholders untouched and sends recipient variables', () => {
    const payload = mapCampaignToEmailLabsPayload({
      id: 'campaign',
      name: 'Campaign',
      subject: 'Subject',
      templateContent: 'Hi {{ Name }}',
      fallbackVariables: {},
      assignedOperatorId: 'operator',
      status: 'ready'
    }, [{ id: 'contact', owningOperatorId: 'operator', email: 'a@example.com', name: 'Anna', personalizationData: {}, validationStatus: 'valid' }], {
      smtpAccount: '1.panel.smtp',
      from: 'sender@example.com'
    });

    expect(payload.templateContent).toContain('{{ Name }}');
    expect(payload.recipients[0]?.variables.Name).toBe('Anna');
    expect(payload.smtpAccount).toBe('1.panel.smtp');
  });

  it('submits form-url-encoded payloads with Basic auth', async () => {
    const fetchCalls: Array<[string, RequestInit]> = [];
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      fetchCalls.push([url, init]);
      return new Response('{"data":{"a@example.com":"provider-id"}}', {
      status: 200,
      headers: { 'x-request-id': 'request-id' }
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const client = new EmailLabsClient({
      baseUrl: 'https://api.example.test',
      applicationKey: 'app-key',
      authorization: 'secret',
      maxRetries: 0
    });

    const result = await client.send({
      smtpAccount: '1.panel.smtp',
      from: 'sender@example.com',
      subject: 'Subject',
      templateContent: 'Hi {{ Name }}',
      recipients: [{ email: 'a@example.com', variables: { Name: 'Anna' }, messageId: 'message-a' }]
    });

    const request = fetchCalls[0]![1];
    expect(request.headers).toMatchObject({
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from('app-key:secret').toString('base64')}`
    });
    expect(String(request.body)).toContain('smtp_account=1.panel.smtp');
    expect(String(request.body)).toContain('to%5Ba%40example.com%5D%5Bvars%5D%5BName%5D=Anna');
    expect(result.providerMessageIds?.['a@example.com']).toBe('provider-id');
  });

  it('splits EmailLabs requests into 200-recipient batches', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const client = new EmailLabsClient({
      baseUrl: 'https://api.example.test',
      applicationKey: 'app-key',
      authorization: 'secret',
      maxRetries: 0
    });

    await client.send({
      smtpAccount: '1.panel.smtp',
      from: 'sender@example.com',
      subject: 'Subject',
      templateContent: 'Hi',
      recipients: Array.from({ length: 201 }, (_, index) => ({
        email: `user-${index}@example.com`,
        variables: { Name: `User ${index}` }
      }))
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
