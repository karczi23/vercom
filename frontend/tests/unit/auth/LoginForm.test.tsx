import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LoginForm } from '../../../src/auth/LoginForm.js';

describe('LoginForm', () => {
  it('submits credentials and stores the authenticated state', async () => {
    const onAuthenticated = vi.fn();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ accessToken: 'token', expiresInSeconds: 900 }), { status: 200 })));

    render(<LoginForm onAuthenticated={onAuthenticated} />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'admin-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => expect(onAuthenticated).toHaveBeenCalledWith({ accessToken: 'token', username: 'admin' }));
  });
});
