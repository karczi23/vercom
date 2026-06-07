import { Router as createRouter, type RequestHandler } from 'express';
import { validateOpenApi } from '../api/openapiMiddleware.js';
import { CampaignRepository } from '../campaigns/campaignRepository.js';
import type { Database } from '../db/client.js';
import { EditorRepository } from './editorRepository.js';
import { EditorService } from './editor.service.js';

export function createCampaignEditorRoutes(db: Database) {
  const router = createRouter();
  const service = new EditorService(db, new CampaignRepository(db), new EditorRepository(db));
  const limitEditorRequests = createRateLimiter(10, 60_000);

  router.use('/campaigns/:campaignId', limitEditorRequests);

  router.get('/campaigns/:campaignId/editor', validateOpenApi('/campaigns/{campaignId}/editor', 'get'), async (req, res, next) => {
    try {
      res.json(await service.getDraft(req.user!, String(req.params.campaignId)));
    } catch (error) {
      next(error);
    }
  });

  router.put('/campaigns/:campaignId/editor', validateOpenApi('/campaigns/{campaignId}/editor', 'put'), async (req, res, next) => {
    try {
      res.json(await service.saveDraft(req.user!, String(req.params.campaignId), req.body));
    } catch (error) {
      next(error);
    }
  });

  router.post('/campaigns/:campaignId/editor/preview', validateOpenApi('/campaigns/{campaignId}/editor/preview', 'post'), async (req, res, next) => {
    try {
      res.json(await service.preview(req.user!, String(req.params.campaignId), req.body));
    } catch (error) {
      next(error);
    }
  });

  router.post('/campaigns/:campaignId/editor/validate', validateOpenApi('/campaigns/{campaignId}/editor/validate', 'post'), async (req, res, next) => {
    try {
      res.json(await service.validatePlaceholders(req.user!, String(req.params.campaignId)));
    } catch (error) {
      next(error);
    }
  });

  router.get('/campaigns/:campaignId/send-outcomes', validateOpenApi('/campaigns/{campaignId}/send-outcomes', 'get'), async (req, res, next) => {
    try {
      res.json(await service.listSendOutcomes(req.user!, String(req.params.campaignId)));
    } catch (error) {
      next(error);
    }
  });

  router.post('/campaigns/:campaignId/recipients/:contactId/force-resend', validateOpenApi('/campaigns/{campaignId}/recipients/{contactId}/force-resend', 'post', '202'), async (req, res, next) => {
    try {
      res.status(202).json(await service.forceResend(req.user!, String(req.params.campaignId), String(req.params.contactId), req.body));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

function createRateLimiter(maxRequests: number, windowMs: number): RequestHandler {
  const buckets = new Map<string, { count: number; resetAt: number }>();
  return (req, res, next) => {
    const now = Date.now();
    const key = `${req.user?.id ?? req.ip}:${req.params.campaignId}`;
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (bucket.count >= maxRequests) {
      res.status(429).json({ error: { code: 'rate_limited', message: 'Too many campaign editor requests' } });
      return;
    }
    bucket.count += 1;
    next();
  };
}
