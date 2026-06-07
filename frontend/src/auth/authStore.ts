export interface AuthState {
  accessToken?: string;
  username?: string;
}

let state: AuthState = {};

export function setAuthState(next: AuthState): void {
  state = next;
}

export function getAuthState(): AuthState {
  return state;
}
