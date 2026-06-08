import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CampaignSetupPanel } from '../../../src/campaigns/CampaignSetupPanel.js';

const campaign = {
  id: 'campaign-1',
  name: 'Campaign',
  subject: 'Subject',
  templateContent: 'Hi {{ company }}',
  fallbackVariables: {},
  assignedOperatorId: 'operator-1',
  status: 'draft' as const
};

const contact = {
  id: 'contact-1',
  email: 'a@example.com',
  name: 'Alice',
  personalizationData: { company: 'Acme' },
  owningOperatorId: 'operator-1',
  validationStatus: 'valid' as const
};

describe('CampaignSetupPanel', () => {
  it('saves recipient selection and runs draft send validation', async () => {
    const onSaveRecipients = vi.fn();
    const onValidateAndSend = vi.fn().mockResolvedValue({ approved: true, items: [] });

    render(
      <CampaignSetupPanel
        campaign={campaign}
        contacts={[contact]}
        loadRecipients={async () => []}
        onSaveRecipients={onSaveRecipients}
        onSaveFallbackVariables={vi.fn()}
        onValidateAndSend={onValidateAndSend}
      />
    );

    await waitFor(() => expect(screen.getByText(/Alice/)).toBeTruthy());
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('Save recipients'));
    expect(onSaveRecipients).toHaveBeenCalledWith('campaign-1', ['contact-1']);

    fireEvent.click(screen.getByText('Validate & send'));
    await waitFor(() => expect(onValidateAndSend).toHaveBeenCalledWith(campaign));
  });
});
