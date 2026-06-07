import { describe, expect, it, vi } from 'vitest';
import { requireCampaignEditorAccess } from '../../../src/campaign-editor/editorAuthorization.js';

describe('editor authorization', () => {
  it('allows admins without assignment lookup', async () => {
    await expect(requireCampaignEditorAccess({} as never, { id: 'admin-1', username: 'admin', role: 'admin' }, 'campaign-1')).resolves.toBeUndefined();
  });

  it('rejects unassigned operators', async () => {
    const db = { select: vi.fn(() => ({ from: () => ({ where: () => ({ limit: () => Promise.resolve([{ assignedOperatorId: 'other' }]) }) }) })) };
    await expect(requireCampaignEditorAccess(db as never, { id: 'operator-1', username: 'op', role: 'operator' }, 'campaign-1')).rejects.toMatchObject({ status: 403 });
  });
});
