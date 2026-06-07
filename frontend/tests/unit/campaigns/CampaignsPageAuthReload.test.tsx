import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CampaignsPage } from '../../../src/campaigns/CampaignsPage.js';

const campaign = {
  id: 'campaign-1',
  name: 'Spring Launch',
  subject: 'Subject',
  templateContent: 'Hi',
  fallbackVariables: {},
  assignedOperatorId: 'operator-1',
  status: 'draft' as const
};

describe('CampaignsPage auth reload', () => {
  it('reloads campaigns after login and clears stale data without a token', async () => {
    const request = vi.fn(async (path: string) => {
      if (path === '/campaigns') {
        return { items: [campaign] };
      }
      if (path === '/campaigns?assignedEditorId=operator-1') {
        return { items: [campaign] };
      }
      return { items: [] };
    });
    const client = { request };

    const { rerender } = render(<CampaignsPage auth={{}} client={client as never} />);
    expect(screen.getByText('Sign in to load campaigns.')).toBeTruthy();
    expect(request).not.toHaveBeenCalled();

    rerender(<CampaignsPage auth={{ accessToken: 'token', username: 'operator' }} client={client as never} />);
    await waitFor(() => expect(screen.getByText('Spring Launch')).toBeTruthy());
    expect(request).toHaveBeenCalledWith('/campaigns');
    expect(request).toHaveBeenCalledWith('/campaigns?assignedEditorId=operator-1');

    rerender(<CampaignsPage auth={{}} client={client as never} />);
    expect(screen.queryByText('Spring Launch')).toBeNull();
    expect(screen.getByText('Sign in to load campaigns.')).toBeTruthy();
  });
});
