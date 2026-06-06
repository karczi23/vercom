# Data Model: Mailing Campaigns

## User

**Purpose**: Authenticates people and automation owners.

**Fields**: `id`, `username`, `passwordHash`, `role`, `createdAt`, `updatedAt`.

**Validation**: `username` unique and non-empty. `role` is `admin` or `operator`.
Passwords are stored only as Argon2id hashes.

**Relationships**: Operators can be assigned campaigns. Admins can access all
records.

## Contact

**Purpose**: Stores recipient delivery and personalization data.

**Fields**: `id`, `email`, `name`, `personalizationData`, `validationStatus`,
`createdAt`, `updatedAt`.

**Validation**: `email` is required, valid, normalized to lowercase, and unique.
Duplicate email submissions are rejected without modifying the existing contact.

**Relationships**: Contacts can belong to many campaign recipient rows.

## Campaign

**Purpose**: Stores campaign content, personalization settings, and access scope.

**Fields**: `id`, `name`, `subject`, `bodyText`, `bodyHtml`, `fallbackText`,
`status`, `assignedOperatorId`, `previewApprovedAt`, `createdByUserId`,
`createdAt`, `updatedAt`.

**Validation**: `name`, `subject`, and at least one body format are required.
Unsupported placeholders are rejected. Missing placeholder values use fallback
text and require preview approval before send.

**States**: `draft` -> `ready` -> `sending` -> `sent` or `failed`. Drafts can be
edited; sending and sent campaigns are immutable except status/outcome fields.

## CampaignRecipient

**Purpose**: Links campaigns to contacts and stores personalized render status.

**Fields**: `id`, `campaignId`, `contactId`, `renderedSubject`, `renderedBodyText`,
`renderedBodyHtml`, `personalizationStatus`, `createdAt`, `updatedAt`.

**Validation**: A campaign-contact pair is unique. Rendering records missing data
and fallback usage.

## SendJob

**Purpose**: Queue item processed asynchronously by the worker.

**Fields**: `id`, `campaignId`, `status`, `attemptCount`, `nextRunAt`,
`lockedAt`, `lockedBy`, `lastError`, `createdAt`, `updatedAt`.

**States**: `pending` -> `processing` -> `completed` or `failed`. Failed jobs can
be retried until the configured retry limit is reached.

## SendAttempt

**Purpose**: Audits each campaign submission to EmailLabs.

**Fields**: `id`, `campaignId`, `sendJobId`, `status`, `providerRequestId`,
`providerStatusCode`, `providerResponseSummary`, `failureReason`, `createdAt`.

**Validation**: Provider secrets are never stored. Response summaries exclude
sensitive headers, keys, and message payload secrets.

## RateLimitEntry

**Purpose**: Tracks caller request counts for 10 requests/minute enforcement.

**Fields**: `id`, `callerKey`, `windowStart`, `requestCount`, `createdAt`,
`updatedAt`.

**Validation**: Caller key is derived from authenticated subject when available,
otherwise from client source.
