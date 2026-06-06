import { eq } from 'drizzle-orm';
import type { AuthenticatedUser } from '@vercom/common/types/shared';
import { campaigns } from '../db/schema.js';
import type { Database } from '../db/client.js';

export function requireAdmin(user: AuthenticatedUser): void {
  if (user.role !== 'admin') {
    throw new Error('Admin role required');
  }
}

export async function canAccessCampaign(db: Database, user: AuthenticatedUser, campaignId: string): Promise<boolean> {
  if (user.role === 'admin') {
    return true;
  }
  const rows = await db.select({ assignedOperatorId: campaigns.assignedOperatorId }).from(campaigns).where(eq(campaigns.id, campaignId)).limit(1);
  return rows[0]?.assignedOperatorId === user.id;
}
