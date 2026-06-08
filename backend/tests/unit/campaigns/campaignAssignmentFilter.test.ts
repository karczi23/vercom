import { describe, expect, it, vi } from 'vitest';
import { CampaignService } from '../../../src/campaigns/campaignService.js';

describe('campaign assignment filtering', () => {
  it('passes assigned editor filters to the campaign repository', async () => {
    const list = vi.fn().mockResolvedValue([]);
    const service = new CampaignService({} as never, { list } as never, {} as never);
    const admin = { id: 'admin', username: 'admin', role: 'admin' as const };

    await service.list(admin, 10, 5, 'operator-1');

    expect(list).toHaveBeenCalledWith(admin, 10, 5, 'operator-1');
  });
});
