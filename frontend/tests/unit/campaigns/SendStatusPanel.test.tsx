import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SendStatusPanel } from '../../../src/campaigns/SendStatusPanel.js';

describe('SendStatusPanel', () => {
  it('shows send attempt failures', () => {
    render(<SendStatusPanel attempts={[{ id: 'a1', campaignId: 'c1', status: 'failed', failureReason: 'Rejected', createdAt: new Date().toISOString() }]} />);
    expect(screen.getByText('failed: Rejected')).toBeTruthy();
  });
});
