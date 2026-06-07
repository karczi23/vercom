import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { loadOpenApiDocument } from './openapiValidator.js';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function loadMergedOpenApiDocument(basePath?: string, deltaPath = defaultCampaignEditorOpenApiPath()): Record<string, unknown> {
  const base = loadOpenApiDocument(basePath);
  if (!fs.existsSync(deltaPath)) {
    return base;
  }

  const delta = YAML.parse(fs.readFileSync(deltaPath, 'utf8')) as Record<string, unknown>;
  return {
    ...base,
    paths: {
      ...asRecord(base.paths),
      ...asRecord(delta.paths)
    },
    components: {
      ...asRecord(base.components),
      schemas: {
        ...asRecord(asRecord(base.components).schemas),
        ...asRecord(asRecord(delta.components).schemas)
      },
      parameters: {
        ...asRecord(asRecord(base.components).parameters),
        ...asRecord(asRecord(delta.components).parameters)
      },
      responses: {
        ...asRecord(asRecord(base.components).responses),
        ...asRecord(asRecord(delta.components).responses)
      },
      securitySchemes: {
        ...asRecord(asRecord(base.components).securitySchemes),
        ...asRecord(asRecord(delta.components).securitySchemes)
      }
    }
  };
}

function defaultCampaignEditorOpenApiPath(): string {
  const current = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(current, 'campaign-editor.openapi.yaml');
}
