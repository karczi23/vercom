import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ContactsPage } from '../../../src/contacts/ContactsPage.js';

describe('ContactsPage auth reload', () => {
  it('reloads contacts after login and clears stale data without a token', async () => {
    const request = vi.fn(async () => ({
      items: [{ id: 'contact-1', email: 'a@example.com', name: 'Alice', owningOperatorId: 'operator-1', validationStatus: 'valid' }]
    }));
    const client = { request };

    const { rerender } = render(<ContactsPage auth={{}} client={client as never} />);
    expect(screen.getByText('Sign in to load contacts.')).toBeTruthy();
    expect(request).not.toHaveBeenCalled();

    rerender(<ContactsPage auth={{ accessToken: 'token', username: 'operator' }} client={client as never} />);
    await waitFor(() => expect(screen.getByText('Alice')).toBeTruthy());
    expect(request).toHaveBeenCalledWith('/contacts');

    rerender(<ContactsPage auth={{}} client={client as never} />);
    expect(screen.queryByText('Alice')).toBeNull();
    expect(screen.getByText('Sign in to load contacts.')).toBeTruthy();
  });
});
