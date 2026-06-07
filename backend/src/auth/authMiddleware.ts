import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../common/apiErrors.js';
import { verifyAccessToken } from './tokenService.js';
import type { AppConfig } from '../common/config.js';
import type { AuthenticatedUser } from '@vercom/common/types/shared';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
  }
}

export function authenticate(config: AppConfig) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.header('authorization');
    if (!header?.startsWith('Bearer ')) {
      next(new ApiError(401, 'unauthorized', 'Missing bearer token'));
      return;
    }
    try {
      req.user = verifyAccessToken(header.slice('Bearer '.length), config.authTokenSecret);
      next();
    } catch {
      next(new ApiError(401, 'unauthorized', 'Invalid bearer token'));
    }
  };
}
