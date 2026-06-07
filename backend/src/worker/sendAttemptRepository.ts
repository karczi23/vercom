import { eq } from 'drizzle-orm';
import type { SendAttempt } from '@vercom/common/types/mailing-campaigns';
import type { Database } from '../db/client.js';
import { sendAttempts } from '../db/schema.js';

function mapAttempt(row: typeof sendAttempts.$inferSelect): SendAttempt {
  return {
    id: row.id,
    campaignId: row.campaignId,
    status: row.status,
    providerRequestId: row.providerRequestId ?? undefined,
    failureReason: row.failureReason ?? undefined,
    createdAt: row.createdAt.toISOString()
  };
}

export class SendAttemptRepository {
  constructor(private readonly db: Database) {}

  async record(input: typeof sendAttempts.$inferInsert): Promise<SendAttempt> {
    const rows = await this.db.insert(sendAttempts).values(input).returning();
    return mapAttempt(rows[0]!);
  }

  async listForCampaign(campaignId: string): Promise<SendAttempt[]> {
    const rows = await this.db.select().from(sendAttempts).where(eq(sendAttempts.campaignId, campaignId));
    return rows.map(mapAttempt);
  }
}
