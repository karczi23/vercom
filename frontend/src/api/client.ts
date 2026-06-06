export interface ApiClientOptions {
  baseUrl?: string;
  getToken?: () => string | undefined;
}

export class ApiClient {
  constructor(private readonly options: ApiClientOptions = {}) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');
    const token = this.options.getToken?.();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const response = await fetch(`${this.options.baseUrl ?? '/api'}${path}`, { ...init, headers });
    if (!response.ok) {
      throw await response.json();
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return response.json() as Promise<T>;
  }
}
