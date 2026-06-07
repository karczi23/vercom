import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CampaignEditorToolbar } from '../../../src/campaign-editor/CampaignEditorToolbar.js';

describe('CampaignEditorToolbar', () => {
  it('wires formatting commands', () => {
    const onBold = vi.fn();
    const onItalic = vi.fn();
    const onHeading = vi.fn();
    const onFont = vi.fn();

    render(<CampaignEditorToolbar onBold={onBold} onItalic={onItalic} onHeading={onHeading} onFont={onFont} />);
    fireEvent.click(screen.getByTitle('Bold'));
    fireEvent.click(screen.getByTitle('Italic'));
    fireEvent.change(screen.getByLabelText('Heading level'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Font family'), { target: { value: 'Verdana' } });

    expect(onBold).toHaveBeenCalledOnce();
    expect(onItalic).toHaveBeenCalledOnce();
    expect(onHeading).toHaveBeenCalledWith(2);
    expect(onFont).toHaveBeenCalledWith('Verdana');
  });
});
