import { describe, expect, it } from 'vitest';
import { CampaignService } from '../../../src/campaigns/campaignService.js';

const admin = { id: 'admin', username: 'admin', role: 'admin' as const };
const operator = { id: 'operator', username: 'operator', role: 'operator' as const };

describe('campaign service', () => {
  it('assigns new campaigns to the authenticated operator', async () => {
    const service = new CampaignService({} as never, {
      create: async (input: unknown) => input
    } as never, {} as never);

    await expect(service.create(operator, {
      name: 'Campaign',
      subject: 'Subject',
      templateContent: 'Hi',
      fallbackVariables: {}
    })).resolves.toMatchObject({
      assignedOperatorId: 'operator'
    });
  });

  it('rejects campaign creation by admins', async () => {
    const service = new CampaignService({} as never, {} as never, {} as never);

    await expect(service.create(admin, {
      name: 'Campaign',
      subject: 'Subject',
      templateContent: 'Hi',
      fallbackVariables: {}
    })).rejects.toMatchObject({
      status: 403
    });
  });

  it('rejects edits to non-draft campaigns', async () => {
    const service = new CampaignService({} as never, {
      findById: async () => ({
        id: 'campaign',
        name: 'Campaign',
        subject: 'Subject',
        templateContent: 'Hi',
        fallbackVariables: {},
        assignedOperatorId: 'operator',
        status: 'ready' as const
      })
    } as never, {} as never);

    await expect(service.update(admin, 'campaign', {
      name: 'Campaign',
      subject: 'Subject',
      templateContent: 'Hi',
      fallbackVariables: {},
      assignedOperatorId: 'operator'
    })).rejects.toMatchObject({
      status: 409,
      code: 'campaign_not_editable'
    });
  });
});
