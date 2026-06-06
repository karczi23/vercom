import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv, { type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import YAML from 'yaml';

export type HttpMethod = 'get' | 'post' | 'patch' | 'put' | 'delete';

export interface OpenApiOperationValidator {
  validateRequestBody?: ValidateFunction | undefined;
  validateResponseBody?: ValidateFunction | undefined;
}

export interface OpenApiValidators {
  getOperation(pathTemplate: string, method: HttpMethod, statusCode?: string): OpenApiOperationValidator;
}

function resolveRef(document: Record<string, unknown>, ref: string): unknown {
  return ref.split('/').slice(1).reduce<unknown>((node, key) => {
    if (node && typeof node === 'object') {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, document);
}

function dereference(document: Record<string, unknown>, value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(item => dereference(document, item));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  const object = value as Record<string, unknown>;
  if (typeof object.$ref === 'string') {
    return dereference(document, resolveRef(document, object.$ref));
  }
  return Object.fromEntries(Object.entries(object).map(([key, child]) => [key, dereference(document, child)]));
}

export function loadOpenApiDocument(filePath = defaultOpenApiPath()): Record<string, unknown> {
  return YAML.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
}

export function createOpenApiValidators(document = loadOpenApiDocument()): OpenApiValidators {
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);

  return {
    getOperation(pathTemplate, method, statusCode = '200') {
      const paths = document.paths as Record<string, Record<string, unknown>>;
      const operation = paths[pathTemplate]?.[method] as Record<string, unknown> | undefined;
      if (!operation) {
        return {};
      }
      const requestSchema = (((operation.requestBody as Record<string, unknown> | undefined)?.content as Record<string, unknown> | undefined)?.['application/json'] as Record<string, unknown> | undefined)?.schema;
      const responseSchema = ((((operation.responses as Record<string, unknown> | undefined)?.[statusCode] as Record<string, unknown> | undefined)?.content as Record<string, unknown> | undefined)?.['application/json'] as Record<string, unknown> | undefined)?.schema;
      return {
        validateRequestBody: requestSchema ? ajv.compile(dereference(document, requestSchema) as object) : undefined,
        validateResponseBody: responseSchema ? ajv.compile(dereference(document, responseSchema) as object) : undefined
      };
    }
  };
}

function defaultOpenApiPath(): string {
  const current = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(current, '../openapi.yaml');
}
