export interface AppConfig {
  databaseUrl: string;
  authTokenSecret: string;
  emailLabsApplicationKey: string;
  emailLabsAuthorization: string;
  emailLabsApiBaseUrl: string;
  port: number;
}

function readRequired(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export function loadConfig(): AppConfig {
  return {
    databaseUrl: readRequired('DATABASE_URL'),
    authTokenSecret: readRequired('AUTH_TOKEN_SECRET'),
    emailLabsApplicationKey: readRequired('EMAILLABS_APPLICATION_KEY'),
    emailLabsAuthorization: readRequired('EMAILLABS_AUTHORIZATION'),
    emailLabsApiBaseUrl: process.env.EMAILLABS_API_BASE_URL ?? 'https://api.emaillabs.net.pl',
    port: Number(process.env.PORT ?? 4000)
  };
}
