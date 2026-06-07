import type { Express } from 'express';
import { signAccessToken } from '../auth/tokenService.js';
import { authenticate } from '../auth/authMiddleware.js';
import { AuthService } from '../auth/authService.js';
import type { AppContext } from './app.js';
import { createContactRoutes } from '../contacts/contactRoutes.js';
import { createCampaignRoutes } from '../campaigns/campaignRoutes.js';
import { createSendRoutes } from '../campaigns/sendRoutes.js';
import { validateOpenApi } from './openapiMiddleware.js';

export function registerRoutes(app: Express, context: AppContext): void {
  const authService = new AuthService(context.db);

  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.post('/api/auth/login', validateOpenApi('/auth/login', 'post'), async (req, res) => {
    const user = await authService.login(String(req.body?.username ?? ''), String(req.body?.password ?? ''));
    res.json(signAccessToken(user, context.config.authTokenSecret));
  });
  app.use('/api', authenticate(context.config));
  app.use('/api', createContactRoutes(context.db));
  app.use('/api', createCampaignRoutes(context.db));
  app.use('/api', createSendRoutes(context.db));
}
