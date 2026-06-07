import { and, eq, inArray } from 'drizzle-orm';
import type { AuthenticatedUser } from '@vercom/common/types/shared';
import type { Database } from '../db/client.js';
import { campaignRecipients, contacts } from '../db/schema.js';

export class CampaignRecipientRepository {
  constructor(private readonly db: Database) {}

  async replaceRecipients(campaignId: string, contactIds: string[]): Promise<void> {
    await this.db.delete(campaignRecipients).where(eq(campaignRecipients.campaignId, campaignId));
    if (contactIds.length === 0) return;
    await this.db.insert(campaignRecipients).values(contactIds.map(contactId => ({ campaignId, contactId })));
  }

  async deleteRecipients(campaignId: string): Promise<void> {
    await this.db.delete(campaignRecipients).where(eq(campaignRecipients.campaignId, campaignId));
  }

  async countAccessibleContacts(user: AuthenticatedUser, contactIds: string[]): Promise<number> {
    const uniqueIds = [...new Set(contactIds)];
    if (uniqueIds.length === 0) return 0;
    const accessCondition = user.role === 'admin'
      ? inArray(contacts.id, uniqueIds)
      : and(inArray(contacts.id, uniqueIds), eq(contacts.owningOperatorId, user.id));
    const rows = await this.db.select({ id: contacts.id }).from(contacts).where(accessCondition);
    return rows.length;
  }

  async listRecipientContacts(campaignId: string) {
    return this.db
      .select({
        contactId: contacts.id,
        email: contacts.email,
        name: contacts.name,
        personalizationData: contacts.personalizationData
      })
      .from(campaignRecipients)
      .innerJoin(contacts, eq(campaignRecipients.contactId, contacts.id))
      .where(eq(campaignRecipients.campaignId, campaignId));
  }

  async updateVariableValidation(campaignId: string, contactId: string, missingVariables: string[], fallbackVariablesUsed: string[]): Promise<void> {
    await this.db
      .update(campaignRecipients)
      .set({
        missingVariables,
        fallbackVariablesUsed,
        variableStatus: missingVariables.length > 0 ? 'missing' : 'valid'
      })
      .where(and(eq(campaignRecipients.campaignId, campaignId), eq(campaignRecipients.contactId, contactId)));
  }

  async updateSendOutcome(campaignId: string, contactId: string, sendStatus: typeof campaignRecipients.$inferSelect.sendStatus, providerMessageId?: string): Promise<void> {
    await this.db
      .update(campaignRecipients)
      .set({
        sendStatus,
        providerMessageId,
        updatedAt: new Date()
      })
      .where(and(eq(campaignRecipients.campaignId, campaignId), eq(campaignRecipients.contactId, contactId)));
  }
}
