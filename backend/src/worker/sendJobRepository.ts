import { and, asc, eq, lte } from 'drizzle-orm';
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

  async claimPending(workerId: string, now = new Date()): Promise<SendJob | undefined> {
    const rows = await this.db
      .select()
      .from(sendJobs)
      .where(and(eq(sendJobs.status, 'pending'), lte(sendJobs.nextRunAt, now)))
      .orderBy(asc(sendJobs.createdAt))
      .limit(1);
    const job = rows[0];
    if (!job) return undefined;
    const updated = await this.db
      .update(sendJobs)
      .set({
        status: 'processing',
        lockedAt: now,
        lockedBy: workerId,
        attemptCount: job.attemptCount + 1,
        updatedAt: now
      })
      .where(and(eq(sendJobs.id, job.id), eq(sendJobs.status, 'pending')))
      .returning();
    return updated[0] ? mapJob(updated[0]) : undefined;
  }

  async mark(id: string, status: SendJob['status'], lastError?: string): Promise<void> {
    await this.db.update(sendJobs).set({ status, lastError, updatedAt: new Date() }).where(eq(sendJobs.id, id));
  }
}
