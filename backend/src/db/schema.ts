import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['admin', 'operator']);
export const validationStatus = pgEnum('validation_status', ['valid', 'invalid']);
export const campaignStatus = pgEnum('campaign_status', ['draft', 'ready', 'sending', 'sent', 'failed']);
export const variableStatus = pgEnum('variable_status', ['pending', 'valid', 'missing']);
export const recipientSendStatus = pgEnum('recipient_send_status', ['pending', 'submitted', 'failed', 'uncertain']);
export const sendJobStatus = pgEnum('send_job_status', ['pending', 'processing', 'completed', 'failed']);
export const sendAttemptStatus = pgEnum('send_attempt_status', [
  'queued',
  'submitted',
  'rejected',
  'timeout',
  'partial_failure',
  'failed'
]);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
};

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: text('username').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: userRole('role').notNull(),
  ...timestamps
}, table => ({
  usernameUnique: uniqueIndex('users_username_unique').on(table.username)
}));

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  personalizationData: jsonb('personalization_data').$type<Record<string, string>>().notNull().default({}),
  validationStatus: validationStatus('validation_status').notNull().default('valid'),
  ...timestamps
}, table => ({
  emailUnique: uniqueIndex('contacts_email_unique').on(table.email)
}));

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  subject: text('subject').notNull(),
  templateContent: text('template_content').notNull(),
  emailLabsTemplateId: text('email_labs_template_id'),
  fallbackVariables: jsonb('fallback_variables').$type<Record<string, string>>().notNull().default({}),
  status: campaignStatus('status').notNull().default('draft'),
  assignedOperatorId: uuid('assigned_operator_id').notNull().references(() => users.id),
  createdByUserId: uuid('created_by_user_id').notNull().references(() => users.id),
  variableValidationApproved: boolean('variable_validation_approved').notNull().default(false),
  ...timestamps
});

export const campaignRecipients = pgTable('campaign_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id),
  contactId: uuid('contact_id').notNull().references(() => contacts.id),
  variableStatus: variableStatus('variable_status').notNull().default('pending'),
  missingVariables: jsonb('missing_variables').$type<string[]>().notNull().default([]),
  fallbackVariablesUsed: jsonb('fallback_variables_used').$type<string[]>().notNull().default([]),
  sendStatus: recipientSendStatus('send_status').notNull().default('pending'),
  providerMessageId: text('provider_message_id'),
  ...timestamps
}, table => ({
  campaignContactUnique: uniqueIndex('campaign_recipients_campaign_contact_unique').on(table.campaignId, table.contactId)
}));

export const sendJobs = pgTable('send_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id),
  status: sendJobStatus('status').notNull().default('pending'),
  attemptCount: integer('attempt_count').notNull().default(0),
  nextRunAt: timestamp('next_run_at', { withTimezone: true }).notNull().defaultNow(),
  lockedAt: timestamp('locked_at', { withTimezone: true }),
  lockedBy: text('locked_by'),
  lastError: text('last_error'),
  ...timestamps
});

export const sendAttempts = pgTable('send_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id),
  sendJobId: uuid('send_job_id').notNull().references(() => sendJobs.id),
  status: sendAttemptStatus('status').notNull(),
  providerRequestId: text('provider_request_id'),
  providerStatusCode: integer('provider_status_code'),
  providerResponseSummary: text('provider_response_summary'),
  failureReason: text('failure_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
