import { Router as createRouter } from 'express';
import { validateOpenApi } from '../api/openapiMiddleware.js';
import { canAccessCampaign } from '../auth/authorization.js';
import { forbidden } from '../common/apiErrors.js';
import type { Database } from '../db/client.js';
import { CampaignRepository } from './campaignRepository.js';
import { SendAttemptRepository } from '../worker/sendAttemptRepository.js';
import { SendJobRepository } from '../worker/sendJobRepository.js';
import { SendQueueService } from '../worker/sendQueueService.js';

export function createSendRoutes(db: Database) {
  const router = createRouter();
  const campaignRepository = new CampaignRepository(db);
  const jobRepository = new SendJobRepository(db);
  const attemptRepository = new SendAttemptRepository(db);
  const queue = new SendQueueService(campaignRepository, jobRepository);

  router.post('/campaigns/:campaignId/send', validateOpenApi('/campaigns/{campaignId}/send', 'post', '202'), async (req, res, next) => {
    try {
      const campaignId = String(req.params.campaignId);
      if (!(await canAccessCampaign(db, req.user!, campaignId))) throw forbidden('Caller cannot access this campaign');
      res.status(202).json(await queue.queueCampaign(campaignId));
    } catch (error) {
      next(error);
    }
  });
  router.get('/campaigns/:campaignId/send-attempts', validateOpenApi('/campaigns/{campaignId}/send-attempts', 'get'), async (req, res, next) => {
    try {
      const campaignId = String(req.params.campaignId);
      if (!(await canAccessCampaign(db, req.user!, campaignId))) throw forbidden('Caller cannot access this campaign');
      res.json({ items: await attemptRepository.listForCampaign(campaignId) });
    } catch (error) {
      next(error);
    }
  });
  return router;
}
