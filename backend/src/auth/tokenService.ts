import jwt from 'jsonwebtoken';
import type { AuthenticatedUser, UserRole } from '@vercom/common/types/shared';

const expiresInSeconds = 15 * 60;

export interface TokenPayload {
  sub: string;
  username: string;
  role: UserRole;
}

export function signAccessToken(user: AuthenticatedUser, secret: string): { accessToken: string; expiresInSeconds: number } {
  return {
    accessToken: jwt.sign({ username: user.username, role: user.role }, secret, {
      subject: user.id,
      expiresIn: expiresInSeconds
    }),
    expiresInSeconds
  };
}

export function verifyAccessToken(token: string, secret: string): AuthenticatedUser {
  const decoded = jwt.verify(token, secret) as TokenPayload;
  return {
    id: decoded.sub,
    username: decoded.username,
    role: decoded.role
  };
}
