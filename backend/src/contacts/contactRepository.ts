import { eq, ilike, or } from 'drizzle-orm';
import type { Contact, ContactInput } from '@vercom/common/types/mailing-campaigns';
import type { Database } from '../db/client.js';
import { contacts } from '../db/schema.js';

function mapContact(row: typeof contacts.$inferSelect): Contact {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    personalizationData: row.personalizationData,
    validationStatus: row.validationStatus
  };
}

export class ContactRepository {
  constructor(private readonly db: Database) {}

  async list(query?: string, limit = 25, offset = 0): Promise<Contact[]> {
    const base = this.db.select().from(contacts);
    const rows = query
      ? await base.where(or(ilike(contacts.email, `%${query}%`), ilike(contacts.name, `%${query}%`))).limit(limit).offset(offset)
      : await base.limit(limit).offset(offset);
    return rows.map(mapContact);
  }

  async findById(id: string): Promise<Contact | undefined> {
    const rows = await this.db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
    return rows[0] ? mapContact(rows[0]) : undefined;
  }

  async findByEmail(email: string): Promise<Contact | undefined> {
    const rows = await this.db.select().from(contacts).where(eq(contacts.email, email)).limit(1);
    return rows[0] ? mapContact(rows[0]) : undefined;
  }

  async create(input: ContactInput): Promise<Contact> {
    const rows = await this.db.insert(contacts).values(input).returning();
    return mapContact(rows[0]!);
  }

  async update(id: string, input: ContactInput): Promise<Contact | undefined> {
    const rows = await this.db.update(contacts).set({ ...input, updatedAt: new Date() }).where(eq(contacts.id, id)).returning();
    return rows[0] ? mapContact(rows[0]) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.db.delete(contacts).where(eq(contacts.id, id)).returning({ id: contacts.id });
    return rows.length > 0;
  }
}
