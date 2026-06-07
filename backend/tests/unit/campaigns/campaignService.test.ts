import { describe, expect, it } from 'vitest';
import { CampaignService } from '../../../src/campaigns/campaignService.js';

const admin = { id: 'admin', username: 'admin', role: 'admin' as const };

describe('campaign service', () => {
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
