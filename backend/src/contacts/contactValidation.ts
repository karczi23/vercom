import type { ContactInput } from '@vercom/common/types/mailing-campaigns';
import { validationError } from '../common/apiErrors.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateContactInput(input: unknown): ContactInput {
  if (!input || typeof input !== 'object') {
    throw validationError('Contact input must be an object');
  }
  const candidate = input as Partial<ContactInput>;
  const email = normalizeEmail(String(candidate.email ?? ''));
  const name = String(candidate.name ?? '').trim();
  const personalizationData = candidate.personalizationData ?? {};

  const errors: Record<string, string> = {};
  if (!emailPattern.test(email)) {
    errors.email = 'Email must be valid';
  }
  if (!name) {
    errors.name = 'Name is required';
  }
  if (typeof personalizationData !== 'object' || Array.isArray(personalizationData)) {
    errors.personalizationData = 'Personalization data must be a key-value object';
  }
  for (const [key, value] of Object.entries(personalizationData)) {
    if (typeof value !== 'string') {
      errors[`personalizationData.${key}`] = 'Personalization values must be strings';
    }
  }
  if (Object.keys(errors).length > 0) {
    throw validationError('Contact input is invalid', errors);
  }
  return { email, name, personalizationData };
}
