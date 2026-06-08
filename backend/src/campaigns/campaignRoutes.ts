import { Router as createRouter } from 'express';
import { validateOpenApi } from '../api/openapiMiddleware.js';
import type { Database } from '../db/client.js';
import { CampaignRepository } from './campaignRepository.js';
import { CampaignRecipientRepository } from './campaignRecipientRepository.js';
import { CampaignService } from './campaignService.js';

export function createCampaignRoutes(db: Database) {
  const router = createRouter();
  const service = new CampaignService(db, new CampaignRepository(db), new CampaignRecipientRepository(db));

  router.get('/campaigns', validateOpenApi('/campaigns', 'get'), async (req, res, next) => {
    try {
      res.json({
        items: await service.list(
          req.user!,
          Number(req.query.limit ?? 25),
          Number(req.query.offset ?? 0),
          typeof req.query.assignedEditorId === 'string' ? req.query.assignedEditorId : undefined
        )
      });
    } catch (error) {
      next(error);
    }
  });
  router.post('/campaigns', validateOpenApi('/campaigns', 'post', '201'), async (req, res, next) => {
    try {
      res.status(201).json(await service.create(req.user!, req.body));
    } catch (error) {
      next(error);
    }
  });
  router.get('/campaigns/:campaignId', validateOpenApi('/campaigns/{campaignId}', 'get'), async (req, res, next) => {
    try {
      res.json(await service.get(req.user!, String(req.params.campaignId)));
    } catch (error) {
      next(error);
    }
  });
  router.patch('/campaigns/:campaignId', validateOpenApi('/campaigns/{campaignId}', 'patch'), async (req, res, next) => {
    try {
      res.json(await service.update(req.user!, String(req.params.campaignId), req.body));
    } catch (error) {
      next(error);
    }
  });
  router.delete('/campaigns/:campaignId', async (req, res, next) => {
    try {
      await service.delete(req.user!, String(req.params.campaignId));
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });
  router.get('/campaigns/:campaignId/recipients', validateOpenApi('/campaigns/{campaignId}/recipients', 'get'), async (req, res, next) => {
    try {
      res.json(await service.listRecipients(req.user!, String(req.params.campaignId)));
    } catch (error) {
      next(error);
    }
  });
  router.post('/campaigns/:campaignId/recipients', validateOpenApi('/campaigns/{campaignId}/recipients', 'post'), async (req, res, next) => {
    try {
      await service.replaceRecipients(req.user!, String(req.params.campaignId), req.body.contactIds ?? []);
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });
  router.post('/campaigns/:campaignId/validate-variables', validateOpenApi('/campaigns/{campaignId}/validate-variables', 'post'), async (req, res, next) => {
    try {
      res.json(await service.validateVariables(req.user!, String(req.params.campaignId), Boolean(req.body.approve)));
    } catch (error) {
      next(error);
    }
  });
  return router;
}
