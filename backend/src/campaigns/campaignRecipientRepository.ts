import { and, eq } from 'drizzle-orm';
import type { Database } from '../db/client.js';
import { campaignRecipients, contacts } from '../db/schema.js';

export class CampaignRecipientRepository {
  constructor(private readonly db: Database) {}

  async replaceRecipients(campaignId: string, contactIds: string[]): Promise<void> {
    await this.db.delete(campaignRecipients).where(eq(campaignRecipients.campaignId, campaignId));
    if (contactIds.length === 0) return;
    await this.db.insert(campaignRecipients).values(contactIds.map(contactId => ({ campaignId, contactId })));
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
}
