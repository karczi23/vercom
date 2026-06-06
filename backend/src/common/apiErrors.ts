import type { Response } from 'express';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function sendApiError(res: Response, error: ApiError): void {
  res.status(error.status).json({
    error: {
      code: error.code,
      message: error.message,
      details: error.details
    }
  });
}

export function notFound(message = 'Resource was not found'): ApiError {
  return new ApiError(404, 'not_found', message);
}

export function forbidden(message = 'Forbidden'): ApiError {
  return new ApiError(403, 'forbidden', message);
}

export function validationError(message: string, details?: unknown): ApiError {
  return new ApiError(400, 'validation_error', message, details);
}
