import { and, eq, ilike, or } from 'drizzle-orm';
import type { Contact, ContactInput } from '@vercom/common/types/mailing-campaigns';
import type { AuthenticatedUser } from '@vercom/common/types/shared';
import type { Database } from '../db/client.js';
import { contacts } from '../db/schema.js';

function mapContact(row: typeof contacts.$inferSelect): Contact {
  return {
    id: row.id,
    owningOperatorId: row.owningOperatorId,
    email: row.email,
    name: row.name,
    personalizationData: row.personalizationData,
    validationStatus: row.validationStatus
  };
}

function ownerCondition(user: AuthenticatedUser) {
  return user.role === 'admin' ? undefined : eq(contacts.owningOperatorId, user.id);
}

export class ContactRepository {
  constructor(private readonly db: Database) {}

  async list(user: AuthenticatedUser, query?: string, limit = 25, offset = 0): Promise<Contact[]> {
    const searchCondition = query ? or(ilike(contacts.email, `%${query}%`), ilike(contacts.name, `%${query}%`)) : undefined;
    const accessCondition = ownerCondition(user);
    const whereCondition = accessCondition && searchCondition
      ? and(accessCondition, searchCondition)
      : accessCondition ?? searchCondition;
    const base = this.db.select().from(contacts);
    const rows = whereCondition
      ? await base.where(whereCondition).limit(limit).offset(offset)
      : await base.limit(limit).offset(offset);
    return rows.map(mapContact);
  }

  async findById(user: AuthenticatedUser, id: string): Promise<Contact | undefined> {
    const accessCondition = ownerCondition(user);
    const whereCondition = accessCondition ? and(eq(contacts.id, id), accessCondition) : eq(contacts.id, id);
    const rows = await this.db.select().from(contacts).where(whereCondition).limit(1);
    return rows[0] ? mapContact(rows[0]) : undefined;
  }

  async findByEmailForOwner(owningOperatorId: string, email: string): Promise<Contact | undefined> {
    const rows = await this.db
      .select()
      .from(contacts)
      .where(and(eq(contacts.owningOperatorId, owningOperatorId), eq(contacts.email, email)))
      .limit(1);
    return rows[0] ? mapContact(rows[0]) : undefined;
  }

  async create(input: ContactInput, owningOperatorId: string): Promise<Contact> {
    const rows = await this.db.insert(contacts).values({ ...input, owningOperatorId }).returning();
    return mapContact(rows[0]!);
  }

  async update(user: AuthenticatedUser, id: string, input: ContactInput): Promise<Contact | undefined> {
    const accessCondition = ownerCondition(user);
    const whereCondition = accessCondition ? and(eq(contacts.id, id), accessCondition) : eq(contacts.id, id);
    const rows = await this.db.update(contacts).set({ ...input, updatedAt: new Date() }).where(whereCondition).returning();
    return rows[0] ? mapContact(rows[0]) : undefined;
  }

  async delete(user: AuthenticatedUser, id: string): Promise<boolean> {
    const accessCondition = ownerCondition(user);
    const whereCondition = accessCondition ? and(eq(contacts.id, id), accessCondition) : eq(contacts.id, id);
    const rows = await this.db.delete(contacts).where(whereCondition).returning({ id: contacts.id });
    return rows.length > 0;
  }
}
