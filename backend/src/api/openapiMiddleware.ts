import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../common/apiErrors.js';
import { createOpenApiValidators, type HttpMethod } from './openapi-validation/openapiValidator.js';
import { loadMergedOpenApiDocument } from './openapi-validation/campaignEditorValidation.js';

const validators = createOpenApiValidators(loadMergedOpenApiDocument());

export function validateOpenApi(pathTemplate: string, method: HttpMethod, successStatus = '200') {
  const operation = validators.getOperation(pathTemplate, method, successStatus);
  const expectedStatus = Number(successStatus);

  return (req: Request, res: Response, next: NextFunction): void => {
    if (operation.validateRequestBody && !operation.validateRequestBody(req.body)) {
      next(new ApiError(400, 'validation_error', 'Request does not match OpenAPI schema', operation.validateRequestBody.errors));
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = ((body: unknown) => {
      const responseValidator = operation.validateResponseBody;
      if (responseValidator && res.statusCode === expectedStatus && !responseValidator(body)) {
        throw new ApiError(500, 'response_validation_error', 'Response does not match OpenAPI schema', responseValidator.errors);
      }
      return originalJson(body);
    }) as Response['json'];

    next();
  };
}
