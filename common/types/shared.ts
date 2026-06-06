export type Identifier = string;

export type UserRole = 'admin' | 'operator';

export interface PageQuery {
  limit: number;
  offset: number;
}

export interface Page<T> {
  items: T[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface AuthenticatedUser {
  id: Identifier;
  username: string;
  role: UserRole;
}
