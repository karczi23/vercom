import { eq } from 'drizzle-orm';
import type { AuthenticatedUser } from '@vercom/common/types/shared';
import type { Database } from '../db/client.js';
import { users } from '../db/schema.js';
import { ApiError } from '../common/apiErrors.js';
import { verifyPassword } from './passwordHash.js';

export class AuthService {
  constructor(private readonly db: Database) {}

  async login(username: string, password: string): Promise<AuthenticatedUser> {
    if (!username || !password) {
      throw invalidCredentials();
    }

    const rows = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    const user = rows[0];
    if (!user || !(await verifyPassword(user.passwordHash, password))) {
      throw invalidCredentials();
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role
    };
  }
}

function invalidCredentials(): ApiError {
  return new ApiError(401, 'unauthorized', 'Invalid credentials');
}
