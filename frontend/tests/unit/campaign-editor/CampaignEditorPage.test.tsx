import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignEditorPage } from '../../../src/campaign-editor/CampaignEditorPage.js';

describe('CampaignEditorPage', () => {
  it('loads saved draft state', async () => {
    const client = {
      request: async (path: string) => {
        if (path.endsWith('/send-outcomes')) {
          return { items: [] };
        }
        return {
          campaignId: 'campaign-1',
          topic: 'Launch',
          templateContent: '<p>Hello {{ Name }}</p>',
          placeholderNames: ['Name'],
          status: 'draft',
          assignedOperatorId: 'operator-1',
          updatedAt: new Date().toISOString()
        };
      }
    };

    render(<CampaignEditorPage campaignId="campaign-1" client={client as never} />);
    expect(await screen.findByDisplayValue('Launch')).toBeTruthy();
    expect(await screen.findByText('{{ Name }}')).toBeTruthy();
  });
});
