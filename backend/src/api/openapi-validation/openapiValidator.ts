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

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

function resolvePointer(document: Record<string, unknown>, ref: string): unknown {
  return ref.split('/').slice(1).reduce<unknown>((node, segment) => {
    return asRecord(node)?.[segment.replace(/~1/g, '/').replace(/~0/g, '~')];
  }, document);
}

function resolveSchemaRefs(document: Record<string, unknown>, schema: unknown): unknown {
  const object = asRecord(schema);
  if (!object) {
    return Array.isArray(schema) ? schema.map(item => resolveSchemaRefs(document, item)) : schema;
  }
  if (typeof object.$ref === 'string') {
    return resolveSchemaRefs(document, resolvePointer(document, object.$ref));
  }
  return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, resolveSchemaRefs(document, value)]));
}

export function loadOpenApiDocument(filePath = defaultOpenApiPath()): Record<string, unknown> {
  return YAML.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
}

export function createOpenApiValidators(document = loadOpenApiDocument()): OpenApiValidators {
  const ajv = new Ajv({ strict: false, allErrors: true });
  addFormats(ajv);

  return {
    getOperation(pathTemplate, method, statusCode = '200') {
      const operation = getOperation(document, pathTemplate, method);
      if (!operation) {
        return {};
      }
      const requestSchema = getJsonSchema(operation.requestBody);
      const responseSchema = getJsonSchema(asRecord(operation.responses)?.[statusCode]);
      return {
        validateRequestBody: requestSchema ? ajv.compile(resolveSchemaRefs(document, requestSchema) as object) : undefined,
        validateResponseBody: responseSchema ? ajv.compile(resolveSchemaRefs(document, responseSchema) as object) : undefined
      };
    }
  };
}

function getOperation(document: Record<string, unknown>, pathTemplate: string, method: HttpMethod): Record<string, unknown> | undefined {
  return asRecord(asRecord(document.paths)?.[pathTemplate])?.[method] as Record<string, unknown> | undefined;
}

function getJsonSchema(section: unknown): unknown {
  return asRecord(asRecord(asRecord(section)?.content)?.['application/json'])?.schema;
}

function defaultOpenApiPath(): string {
  const current = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(current, '../openapi.yaml');
}
