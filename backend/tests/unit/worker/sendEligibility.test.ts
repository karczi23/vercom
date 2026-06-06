import { describe, expect, it } from 'vitest';
import { isSafeToSubmit } from '../../../src/worker/sendWorkerService.js';

describe('send eligibility', () => {
  it('prevents resubmitting submitted or uncertain recipients automatically', () => {
    expect(isSafeToSubmit('pending')).toBe(true);
    expect(isSafeToSubmit('failed')).toBe(true);
    expect(isSafeToSubmit('submitted')).toBe(false);
    expect(isSafeToSubmit('uncertain')).toBe(false);
  });
});
