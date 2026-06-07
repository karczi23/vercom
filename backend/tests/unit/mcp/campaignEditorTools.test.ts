import { describe, expect, it } from 'vitest';
import { createCampaignEditorTools } from '../../../src/mcp/campaignEditorTools.js';

describe('campaign editor MCP tools', () => {
  it('exposes editor recovery tool names', () => {
    const tools = createCampaignEditorTools({ db: {} as never, user: { id: 'admin-1', username: 'admin', role: 'admin' } });
    expect(Object.keys(tools)).toEqual([
      'campaign_editor_get_draft',
      'campaign_editor_save_draft',
      'campaign_editor_validate',
      'campaign_send_outcomes',
      'campaign_force_resend_uncertain_recipient'
    ]);
  });
});
