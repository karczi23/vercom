import type { Router } from 'express';
import { Router as createRouter } from 'express';
import type { Database } from '../db/client.js';
import { validateOpenApi } from '../api/openapiMiddleware.js';
import { ContactRepository } from './contactRepository.js';
import { ContactService } from './contactService.js';

export function createContactRoutes(db: Database): Router {
  const router = createRouter();
  const service = new ContactService(new ContactRepository(db));

  router.get('/contacts', validateOpenApi('/contacts', 'get'), async (req, res, next) => {
    try {
      const limit = Number(req.query.limit ?? 25);
      const offset = Number(req.query.offset ?? 0);
      res.json({ items: await service.list(req.user!, req.query.query as string | undefined, limit, offset) });
    } catch (error) {
      next(error);
    }
  });

  router.post('/contacts', validateOpenApi('/contacts', 'post', '201'), async (req, res, next) => {
    try {
      res.status(201).json(await service.create(req.user!, req.body));
    } catch (error) {
      next(error);
    }
  });

  router.get('/contacts/:contactId', validateOpenApi('/contacts/{contactId}', 'get'), async (req, res, next) => {
    try {
      res.json(await service.get(req.user!, String(req.params.contactId)));
    } catch (error) {
      next(error);
    }
  });

  router.patch('/contacts/:contactId', validateOpenApi('/contacts/{contactId}', 'patch'), async (req, res, next) => {
    try {
      res.json(await service.update(req.user!, String(req.params.contactId), req.body));
    } catch (error) {
      next(error);
    }
  });

  router.delete('/contacts/:contactId', async (req, res, next) => {
    try {
      await service.delete(req.user!, String(req.params.contactId));
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  return router;
}
