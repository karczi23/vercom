import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CampaignForm } from '../../../src/campaigns/CampaignForm.js';

describe('CampaignForm', () => {
  it('renders campaign save controls', () => {
    render(<CampaignForm onSubmit={vi.fn()} />);
    expect(screen.getByText('Save campaign')).toBeTruthy();
  });
});
