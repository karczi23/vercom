import type { CampaignInput } from '@vercom/common/types/mailing-campaigns';
import { validationError } from '../common/apiErrors.js';
import { findUnsupportedPlaceholders } from './placeholderService.js';

export function validateCampaignInput(raw: unknown): CampaignInput {
  if (!raw || typeof raw !== 'object') {
    throw validationError('Campaign input must be an object');
  }
  const input = raw as Partial<CampaignInput>;
  const errors: Record<string, string> = {};
  if (!input.name?.trim()) errors.name = 'Name is required';
  if (!input.subject?.trim()) errors.subject = 'Subject is required';
  if (!input.templateContent?.trim()) errors.templateContent = 'Template content is required';
  if (!input.assignedOperatorId?.trim()) errors.assignedOperatorId = 'Assigned operator is required';
  if (!input.fallbackVariables || typeof input.fallbackVariables !== 'object') {
    errors.fallbackVariables = 'Fallback variables are required';
  }
  const unsupported = findUnsupportedPlaceholders(input.templateContent ?? '');
  if (unsupported.length > 0) {
    errors.templateContent = `Unsupported placeholders: ${unsupported.join(', ')}`;
  }
  if (Object.keys(errors).length > 0) {
    throw validationError('Campaign input is invalid', errors);
  }
  return {
    name: input.name!.trim(),
    subject: input.subject!.trim(),
    templateContent: input.templateContent!,
    emailLabsTemplateId: input.emailLabsTemplateId,
    fallbackVariables: input.fallbackVariables!,
    assignedOperatorId: input.assignedOperatorId!
  };
}

export function validateCampaignUpdateInput(current: CampaignInput, raw: unknown): CampaignInput {
  if (!raw || typeof raw !== 'object') {
    throw validationError('Campaign input must be an object');
  }
  const patch = raw as Partial<CampaignInput>;
  return validateCampaignInput({
    ...current,
    ...patch,
    fallbackVariables: patch.fallbackVariables ?? current.fallbackVariables
  });
}
