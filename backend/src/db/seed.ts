import { and, eq } from 'drizzle-orm';
import { campaignRecipients, campaigns, contacts, users } from './schema.js';
import { createDatabase } from './client.js';
import { hashPassword } from '../auth/passwordHash.js';
import { logger } from '../common/logger.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Missing required environment variable DATABASE_URL');
}

const db = createDatabase(databaseUrl);

async function seed() {
  await db.insert(users).values([
    { username: 'admin', passwordHash: await hashPassword('admin-password'), role: 'admin' },
    { username: 'operator-a', passwordHash: await hashPassword('operator-a-password'), role: 'operator' },
    { username: 'operator-b', passwordHash: await hashPassword('operator-b-password'), role: 'operator' }
  ]).onConflictDoNothing();

  const [admin, operatorA, operatorB] = await Promise.all([
    findUser('admin'),
    findUser('operator-a'),
    findUser('operator-b')
  ]);

  if (!admin || !operatorA || !operatorB) {
    throw new Error('Expected seed users were not found after insertion');
  }

  const operatorAContacts = await seedContacts(operatorA.id, [
    { email: 'k.kozlinka@proton.me', name: 'Karol Kozlinka', personalizationData: { company: 'Acme', plan: 'Premium' } },
    { email: 'bartek.operator-a@example.com', name: 'Bartek Kowalski', personalizationData: { company: 'Globex', plan: 'Standard' } },
    { email: 'celina.operator-a@example.com', name: 'Celina Wisniewska', personalizationData: { company: 'Initech', plan: 'Trial' } }
  ]);
  const operatorBContacts = await seedContacts(operatorB.id, [
    { email: 'estrangelo1@gmail.com', name: 'Karol Kozlinka', personalizationData: { company: 'Umbrella', plan: 'Premium' } },
    { email: 'emil.operator-b@example.com', name: 'Emil Wozniak', personalizationData: { company: 'Soylent', plan: 'Standard' } },
    { email: 'filip.operator-b@example.com', name: 'Filip Kaminski', personalizationData: { company: 'Stark', plan: 'Trial' } }
  ]);

  await seedCampaigns(admin.id, operatorA.id, operatorAContacts.map(contact => contact.id), [
    {
      name: 'Operator A Welcome Campaign',
      subject: 'Welcome, {{ Name }}',
      templateContent: 'Hello {{ Name }}, welcome to {{ company }}. Your plan is {{ plan }}.',
      fallbackVariables: { company: 'your company', plan: 'Standard' }
    },
    {
      name: 'Operator A Renewal Campaign',
      subject: 'Renewal reminder for {{ company }}',
      templateContent: 'Hi {{ Name }}, your {{ plan }} renewal is coming up.',
      fallbackVariables: { company: 'your company', plan: 'Standard' }
    }
  ]);
  await seedCampaigns(admin.id, operatorB.id, operatorBContacts.map(contact => contact.id), [
    {
      name: 'Operator B Onboarding Campaign',
      subject: 'Getting started, {{ Name }}',
      templateContent: 'Hello {{ Name }}, here are next steps for {{ company }}.',
      fallbackVariables: { company: 'your company' }
    },
    {
      name: 'Operator B Product Update Campaign',
      subject: 'Product update for {{ company }}',
      templateContent: 'Hi {{ Name }}, your {{ plan }} plan has a new update.',
      fallbackVariables: { company: 'your company', plan: 'Standard' }
    }
  ]);

  logger.info('Seeded users, contacts, campaigns, and campaign recipients');
}

await seed();

async function findUser(username: string) {
  const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return rows[0];
}

async function seedContacts(owningOperatorId: string, values: Array<{ email: string; name: string; personalizationData: Record<string, string> }>) {
  const seeded = [];
  for (const value of values) {
    const existing = await findContact(owningOperatorId, value.email);
    if (existing) {
      seeded.push(existing);
      continue;
    }
    const rows = await db.insert(contacts).values({ ...value, owningOperatorId }).returning();
    seeded.push(rows[0]!);
  }
  return seeded;
}

async function findContact(owningOperatorId: string, email: string) {
  const rows = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.owningOperatorId, owningOperatorId), eq(contacts.email, email)))
    .limit(1);
  return rows[0];
}

async function seedCampaigns(
  createdByUserId: string,
  assignedOperatorId: string,
  contactIds: string[],
  values: Array<{ name: string; subject: string; templateContent: string; fallbackVariables: Record<string, string> }>
) {
  for (const value of values) {
    const campaign = await findOrCreateCampaign(createdByUserId, assignedOperatorId, value);
    await seedCampaignRecipients(campaign.id, contactIds);
  }
}

async function findOrCreateCampaign(
  createdByUserId: string,
  assignedOperatorId: string,
  value: { name: string; subject: string; templateContent: string; fallbackVariables: Record<string, string> }
) {
  const existing = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.assignedOperatorId, assignedOperatorId), eq(campaigns.name, value.name)))
    .limit(1);
  if (existing[0]) {
    return existing[0];
  }

  const rows = await db.insert(campaigns).values({
    ...value,
    assignedOperatorId,
    createdByUserId
  }).returning();
  return rows[0]!;
}

async function seedCampaignRecipients(campaignId: string, contactIds: string[]) {
  for (const contactId of contactIds) {
    await db.insert(campaignRecipients).values({ campaignId, contactId }).onConflictDoNothing();
  }
}
