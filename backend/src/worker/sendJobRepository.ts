import { eq } from 'drizzle-orm';
import type { SendJob } from '@vercom/common/types/mailing-campaigns';
import type { Database } from '../db/client.js';
import { sendJobs } from '../db/schema.js';

function mapJob(row: typeof sendJobs.$inferSelect): SendJob {
  return { id: row.id, campaignId: row.campaignId, status: row.status };
}

export class SendJobRepository {
  constructor(private readonly db: Database) {}

  async enqueue(campaignId: string): Promise<SendJob> {
    const rows = await this.db.insert(sendJobs).values({ campaignId }).returning();
    return mapJob(rows[0]!);
  }

  async listForCampaign(campaignId: string): Promise<SendJob[]> {
    const rows = await this.db.select().from(sendJobs).where(eq(sendJobs.campaignId, campaignId));
    return rows.map(mapJob);
  }

  async mark(id: string, status: SendJob['status'], lastError?: string): Promise<void> {
    await this.db.update(sendJobs).set({ status, lastError }).where(eq(sendJobs.id, id));
  }
}
