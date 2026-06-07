import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PellEditor } from '../../../src/campaign-editor/PellEditor.js';

describe('PellEditor', () => {
  it('renders initial editor content', () => {
    const { container } = render(<PellEditor value="<p>Hello</p>" onChange={vi.fn()} />);
    expect(container.innerHTML).toContain('Hello');
  });
});
