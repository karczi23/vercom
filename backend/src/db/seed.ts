import { and, eq } from 'drizzle-orm';
import { campaignRecipients, campaigns, contacts, users } from './schema.js';
import { createDatabase } from './client.js';
import { hashPassword } from '../auth/passwordHash.js';
import { logger, redactSecrets } from '../common/logger.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Missing required environment variable DATABASE_URL');
}

const db = createDatabase(databaseUrl);
const emailLabsConfig = loadEmailLabsSeedConfig();

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
    if (!existing[0].emailLabsTemplateId) {
      const emailLabsTemplateId = await ensureEmailLabsTemplate(value);
      const rows = await db
        .update(campaigns)
        .set({ emailLabsTemplateId, updatedAt: new Date() })
        .where(eq(campaigns.id, existing[0].id))
        .returning();
      return rows[0]!;
    }
    return existing[0];
  }

  const emailLabsTemplateId = await ensureEmailLabsTemplate(value);
  const rows = await db.insert(campaigns).values({
    ...value,
    emailLabsTemplateId,
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

interface EmailLabsSeedConfig {
  baseUrl: string;
  applicationKey: string;
  authorization: string;
  smtpAccount: string;
  fromEmail: string;
  templateApiPath: string;
}

function loadEmailLabsSeedConfig(): EmailLabsSeedConfig {
  return {
    baseUrl: readRequired('EMAILLABS_API_BASE_URL'),
    applicationKey: readRequired('EMAILLABS_APPLICATION_KEY'),
    authorization: readRequired('EMAILLABS_AUTHORIZATION'),
    smtpAccount: readRequired('EMAILLABS_SMTP_ACCOUNT'),
    fromEmail: readRequired('EMAILLABS_FROM_EMAIL'),
    templateApiPath: process.env.EMAILLABS_TEMPLATE_API_PATH ?? '/api/add_template'
  };
}

function readRequired(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

async function ensureEmailLabsTemplate(value: { name: string; subject: string; templateContent: string }) {
  const requestBody = new URLSearchParams();
  requestBody.set('html', value.templateContent);

  const response = await fetch(`${emailLabsConfig.baseUrl}${emailLabsConfig.templateApiPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${emailLabsConfig.applicationKey}:${emailLabsConfig.authorization}`).toString('base64')}`
    },
    body: requestBody
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`EmailLabs template creation failed for "${value.name}" with status ${response.status}: ${redactSecrets(body)}`);
  }

  const templateId = extractTemplateId(body);
  if (!templateId) {
    throw new Error(`EmailLabs template creation response for "${value.name}" did not include a template id`);
  }
  return templateId;
}

function extractTemplateId(body: string): string | undefined {
  const parsed = JSON.parse(body) as unknown;
  return findTemplateId(parsed);
}

function findTemplateId(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  for (const key of ['template_id', 'templateId', 'id']) {
    if (typeof record[key] === 'string' || typeof record[key] === 'number') {
      return String(record[key]);
    }
  }
  for (const nested of Object.values(record)) {
    const templateId = Array.isArray(nested)
      ? nested.map(item => findTemplateId(item)).find(Boolean)
      : findTemplateId(nested);
    if (templateId) return templateId;
  }
  return undefined;
}
