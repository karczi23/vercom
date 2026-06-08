import type { AuthenticatedUser } from '@vercom/common/types/shared';
import { canAccessCampaign } from '../auth/authorization.js';
import { forbidden } from '../common/apiErrors.js';
import type { Database } from '../db/client.js';

export async function requireCampaignEditorAccess(db: Database, user: AuthenticatedUser, campaignId: string): Promise<void> {
  if (!(await canAccessCampaign(db, user, campaignId))) {
    throw forbidden('Caller cannot access this campaign editor');
  }
}
