# Data Model: Mailing Campaigns

## User

**Purpose**: Authenticates people and automation owners.

**Fields**: `id`, `username`, `passwordHash`, `role`, `createdAt`, `updatedAt`.

**Validation**: `username` unique and non-empty. `role` is `admin` or `operator`.
Passwords are stored only as Argon2id hashes.

**Relationships**: Operators own contacts they create and can be assigned
campaigns. Admins can access all contacts and campaigns.

## Contact

**Purpose**: Stores recipient delivery data and variables used for provider-side
placeholder replacement.

**Fields**: `id`, `owningOperatorId`, `email`, `name`, `personalizationData`,
`validationStatus`, `createdAt`, `updatedAt`.

**Validation**: `email` and `name` are required. `email` must be valid,
normalized to lowercase, and unique per owning operator. Duplicate email
submissions by the same owning operator are rejected without modifying the
existing contact, while different operators may store contacts with the same
email address.

**Personalization Data**: `personalizationData` contains optional key-value
variables passed to EmailLabs for placeholders beyond the required contact
fields. For example, a contact named "Anna Kowalska" may have
`personalizationData` values such as `company: "ACME"` or `plan: "Premium"` so a
campaign can use `{{ company }}` or `{{ plan }}`. Required built-in variables
such as contact name and email come from first-class contact fields, not from
`personalizationData`.

**Relationships**: Contacts belong to the operator who created them and can
belong to many campaign recipient rows. Admins can access all contacts;
operators can access only their own contacts.

## Campaign

**Purpose**: Stores one campaign template body, personalization settings, and
access scope.

**Fields**: `id`, `name`, `subject`, `templateContent`, `fallbackVariables`,
`emailLabsTemplateId`, `status`, `assignedOperatorId`, `createdByUserId`,
`createdAt`, `updatedAt`.

**Validation**: `name`, `subject`, and `templateContent` are required. There is
one campaign body format in the application model. Unsupported placeholders are
rejected. Missing placeholder values use fallback variables and require variable
validation approval before send. Vercom does not store per-recipient rendered
bodies by default; EmailLabs performs final placeholder replacement from
form-encoded `to[email][vars]` fields.

**States**: `draft` -> `ready` -> `sending` -> `sent` or `failed`. Drafts can be
edited; sending and sent campaigns are immutable except status/outcome fields.

## CampaignRecipient

**Purpose**: Links campaigns to contacts and stores variable validation and send
state.

**Fields**: `id`, `campaignId`, `contactId`, `variableStatus`,
`missingVariables`, `fallbackVariablesUsed`, `sendStatus`, `providerMessageId`,
`createdAt`, `updatedAt`.

**Validation**: A campaign-contact pair is unique. Rendering records missing data
and fallback usage are validation metadata only; full rendered message bodies are
not duplicated into this table.

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
sensitive headers, keys, and message payload secrets. Provider message IDs
returned by EmailLabs are mapped back to recipient outcomes when available.
