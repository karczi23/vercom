import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import { ApiError, sendApiError } from '../common/apiErrors.js';
import type { AppConfig } from '../common/config.js';
import type { Database } from '../db/client.js';
import { registerRoutes } from './routes.js';

export interface AppContext {
  config: AppConfig;
  db: Database;
}

export function createApp(context: AppContext) {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  registerRoutes(app, context);
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ApiError) {
      sendApiError(res, error);
      return;
    }
    res.status(500).json({ error: { code: 'internal_error', message: 'Unexpected server error' } });
  });
  return app;
}
