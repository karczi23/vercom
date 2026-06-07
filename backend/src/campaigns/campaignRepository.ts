import { eq } from 'drizzle-orm';
import type { Campaign, CampaignInput } from '@vercom/common/types/mailing-campaigns';
import type { AuthenticatedUser } from '@vercom/common/types/shared';
import type { Database } from '../db/client.js';
import { campaigns } from '../db/schema.js';

function mapCampaign(row: typeof campaigns.$inferSelect): Campaign {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    templateContent: row.templateContent,
    emailLabsTemplateId: row.emailLabsTemplateId ?? undefined,
    fallbackVariables: row.fallbackVariables,
    assignedOperatorId: row.assignedOperatorId,
    status: row.status
  };
}

export class CampaignRepository {
  constructor(private readonly db: Database) {}

  async list(user: AuthenticatedUser, limit = 25, offset = 0): Promise<Campaign[]> {
    const query = this.db.select().from(campaigns);
    const rows = user.role === 'admin'
      ? await query.limit(limit).offset(offset)
      : await query.where(eq(campaigns.assignedOperatorId, user.id)).limit(limit).offset(offset);
    return rows.map(mapCampaign);
  }

  async findById(id: string): Promise<Campaign | undefined> {
    const rows = await this.db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
    return rows[0] ? mapCampaign(rows[0]) : undefined;
  }

  async create(input: CampaignInput, createdByUserId: string): Promise<Campaign> {
    const rows = await this.db.insert(campaigns).values({ ...input, createdByUserId }).returning();
    return mapCampaign(rows[0]!);
  }

  async update(id: string, input: CampaignInput): Promise<Campaign | undefined> {
    const rows = await this.db.update(campaigns).set({ ...input, updatedAt: new Date() }).where(eq(campaigns.id, id)).returning();
    return rows[0] ? mapCampaign(rows[0]) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.delete(campaigns).where(eq(campaigns.id, id)).returning({ id: campaigns.id });
    return rows.length > 0;
  }

  async approveVariables(id: string, approved: boolean): Promise<void> {
    await this.db.update(campaigns).set({ variableValidationApproved: approved, status: approved ? 'ready' : 'draft' }).where(eq(campaigns.id, id));
  }

  async markStatus(id: string, status: Campaign['status']): Promise<void> {
    await this.db.update(campaigns).set({ status, updatedAt: new Date() }).where(eq(campaigns.id, id));
  }
}
