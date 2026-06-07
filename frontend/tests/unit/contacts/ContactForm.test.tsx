import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContactForm } from '../../../src/contacts/ContactForm.js';

describe('ContactForm', () => {
  it('renders save controls', () => {
    render(<ContactForm onSubmit={vi.fn()} />);

    expect(screen.getByText('Save')).toBeTruthy();
  });
});
