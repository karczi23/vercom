import { describe, expect, it, vi } from 'vitest';
import { EditorService } from '../../../src/campaign-editor/editor.service.js';

describe('editor service', () => {
  it('sanitizes and persists draft content', async () => {
    let saved = '';
    const campaigns = {
      findById: vi.fn().mockResolvedValue({
        id: 'campaign-1',
        name: 'Campaign',
        subject: 'Old',
        templateContent: '<p>Old</p>',
        fallbackVariables: {},
        assignedOperatorId: 'operator-1',
        status: 'draft'
      })
    };
    const repository = {
      saveDraft: vi.fn(async (_id: string, _topic: string, templateContent: string) => { saved = templateContent; }),
      getDraft: vi.fn(async (campaignId: string, placeholderNames: string[], warnings: string[]) => ({
        campaignId,
        topic: 'Topic',
        templateContent: saved,
        placeholderNames,
        sanitizationWarnings: warnings,
        status: 'draft',
        assignedOperatorId: 'operator-1',
        updatedAt: new Date().toISOString()
      }))
    };
    const service = new EditorService({} as never, campaigns as never, repository as never);

    const result = await service.saveDraft({ id: 'admin-1', username: 'admin', role: 'admin' }, 'campaign-1', {
      topic: 'Topic',
      templateContent: '<p>Hello {{ Name }}</p><script>alert(1)</script>'
    });

    expect(result.templateContent).not.toContain('script');
    expect(result.placeholderNames).toEqual(['Name']);
  });
});
