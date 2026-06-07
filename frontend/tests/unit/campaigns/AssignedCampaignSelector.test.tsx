import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { AssignedCampaignSelector } from '../../../src/campaigns/AssignedCampaignSelector.js';

const campaigns = [
  {
    id: 'campaign-1',
    name: 'First',
    subject: 'Subject',
    templateContent: 'Hi',
    fallbackVariables: {},
    assignedOperatorId: 'operator-1',
    status: 'draft' as const
  },
  {
    id: 'campaign-2',
    name: 'Second',
    subject: 'Subject',
    templateContent: 'Hi',
    fallbackVariables: {},
    assignedOperatorId: 'operator-2',
    status: 'draft' as const
  }
];

describe('AssignedCampaignSelector', () => {
  it('selects an assigned editor and reports empty states', () => {
    const onSelect = vi.fn();
    render(<AssignedCampaignSelector campaigns={campaigns} selectedEditorId="operator-1" onSelectEditor={onSelect} visibleCampaignCount={1} />);

    fireEvent.change(screen.getByLabelText('Assigned editor'), { target: { value: 'operator-2' } });

    expect(onSelect).toHaveBeenCalledWith('operator-2');
    expect(screen.getByText('1 campaign assigned')).toBeTruthy();
  });

  it('shows an empty state for selected editors with no campaigns', () => {
    render(<AssignedCampaignSelector campaigns={campaigns} selectedEditorId="operator-3" onSelectEditor={vi.fn()} visibleCampaignCount={0} />);

    expect(screen.getByText('No campaigns assigned to this editor.')).toBeTruthy();
  });
});
