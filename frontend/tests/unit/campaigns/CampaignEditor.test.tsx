import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignForm } from '../../../src/campaigns/CampaignForm.js';

describe('CampaignForm', () => {
  it('renders rich text campaign creation controls', () => {
    render(<CampaignForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Save campaign')).toBeTruthy();
    expect(screen.getByLabelText('Topic')).toBeTruthy();
    expect(screen.getByLabelText('Campaign editor toolbar')).toBeTruthy();
    expect(screen.getByTitle('Bold')).toBeTruthy();
    expect(screen.queryByLabelText('Assigned operator')).toBeNull();
  });
});
