import React from 'react';

export function AuthorizationBoundary({ allowed, children }: { allowed: boolean; children: React.ReactNode }) {
  if (!allowed) {
    return <p role="alert">You are not allowed to access this campaign.</p>;
  }
  return <>{children}</>;
}
