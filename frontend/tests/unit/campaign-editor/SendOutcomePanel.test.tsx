import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SendOutcomePanel } from '../../../src/campaign-editor/SendOutcomePanel.js';

describe('SendOutcomePanel', () => {
  it('shows uncertain recipients and force resend action', () => {
    const onForceResend = vi.fn();
    render(<SendOutcomePanel items={[{ campaignId: 'campaign-1', contactId: 'contact-1', contactEmail: 'a@example.com', contactName: 'Alice', sendStatus: 'uncertain', requiresReview: true, forceResendAllowed: true }]} onForceResend={onForceResend} />);
    fireEvent.click(screen.getByText('Force resend'));
    expect(screen.getByText('uncertain')).toBeTruthy();
    expect(onForceResend).toHaveBeenCalledWith('contact-1');
  });
});
