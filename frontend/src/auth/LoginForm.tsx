import React, { useState } from 'react';
import { ApiClient } from '../api/client.js';
import { setAuthState, type AuthState } from './authStore.js';

interface LoginFormProps {
  onAuthenticated: (state: AuthState) => void;
}

export function LoginForm({ onAuthenticated }: LoginFormProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(undefined);
    try {
      const response = await new ApiClient().request<{ accessToken: string; expiresInSeconds: number }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      const next = { accessToken: response.accessToken, username };
      setAuthState(next);
      onAuthenticated(next);
    } catch {
      setError('Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={submit}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Secure access</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-950">Sign in</h2>
      </div>
      <label>
        Username
        <input autoComplete="username" value={username} onChange={event => setUsername(event.target.value)} />
      </label>
      <label>
        Password
        <input autoComplete="current-password" type="password" value={password} onChange={event => setPassword(event.target.value)} />
      </label>
      {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
      <button disabled={isSubmitting} type="submit">{isSubmitting ? 'Signing in' : 'Sign in'}</button>
    </form>
  );
}
