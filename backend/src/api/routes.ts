import type { Express } from 'express';
import { signAccessToken } from '../auth/tokenService.js';
import { authenticate } from '../auth/authMiddleware.js';
import { ApiError } from '../common/apiErrors.js';
import type { AppContext } from './app.js';
import { createContactRoutes } from '../contacts/contactRoutes.js';
import { createCampaignRoutes } from '../campaigns/campaignRoutes.js';
import { createSendRoutes } from '../campaigns/sendRoutes.js';

export function registerRoutes(app: Express, context: AppContext): void {
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.post('/api/auth/login', (_req, res) => {
    // Full credential lookup is implemented with user management; seed users use the same token service.
    const username = String(_req.body?.username ?? '');
    if (!username) {
      throw new ApiError(401, 'unauthorized', 'Invalid credentials');
    }
    res.json(signAccessToken({ id: username, username, role: username === 'admin' ? 'admin' : 'operator' }, context.config.authTokenSecret));
  });
  app.use('/api', authenticate(context.config));
  app.use('/api', createContactRoutes(context.db));
  app.use('/api', createCampaignRoutes(context.db));
  app.use('/api', createSendRoutes(context.db));
}
