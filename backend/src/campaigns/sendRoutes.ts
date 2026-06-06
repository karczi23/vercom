import { Router as createRouter } from 'express';
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

  router.post('/campaigns/:campaignId/send', async (req, res, next) => {
    try {
      if (!(await canAccessCampaign(db, req.user!, req.params.campaignId))) throw forbidden('Caller cannot access this campaign');
      res.status(202).json(await queue.queueCampaign(req.params.campaignId));
    } catch (error) {
      next(error);
    }
  });
  router.get('/campaigns/:campaignId/send-attempts', async (req, res, next) => {
    try {
      if (!(await canAccessCampaign(db, req.user!, req.params.campaignId))) throw forbidden('Caller cannot access this campaign');
      res.json({ items: await attemptRepository.listForCampaign(req.params.campaignId) });
    } catch (error) {
      next(error);
    }
  });
  return router;
}
