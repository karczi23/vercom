import { describe, expect, it } from 'vitest';
import { SendWorkerService } from '../../../src/worker/sendWorkerService.js';

describe('send worker', () => {
  it('submits mapped campaign payload through EmailLabs client', async () => {
    const service = new SendWorkerService({ send: async () => ({ status: 'submitted' }) } as never);
    const result = await service.submit({
      id: 'campaign',
      name: 'Campaign',
      subject: 'Subject',
      templateContent: 'Hi {{ Name }}',
      fallbackVariables: {},
      assignedOperatorId: 'operator',
      status: 'ready'
    }, [{ id: 'contact', email: 'a@example.com', name: 'Anna', personalizationData: {} }]);

    expect(result.status).toBe('submitted');
  });
});
