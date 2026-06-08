# Data Model: Campaign Editor

## CampaignEditorDraft

**Purpose**: Represents the editable campaign definition shown in the CMS-like
screen.

**Fields**: `campaignId`, `topic`, `templateContent`, `placeholderNames`,
`assignedOperatorId`, `status`, `createdAt`, `updatedAt`.

**Validation**:
- `topic` is required and non-empty.
- `templateContent` is required and stores one sanitized allowed-HTML body.
- Direct typed or pasted HTML must be escaped or stripped so it is preserved only
  as text, not interpreted as operator-authored markup.
- `placeholderNames` is derived from valid `{{ value }}` tokens in
  `templateContent`.
- Draft edits are allowed only while the campaign is editable according to the
  mailing campaigns state rules.

**Relationships**: Extends the feature-001 `Campaign` entity. The assigned
operator restriction from `Campaign.assignedOperatorId` applies to every editor
action.

## EditorAssignmentFilter

**Purpose**: Represents the main campaign page selection used to choose which
editor/operator's campaigns are visible and selectable before opening a campaign
editor.

**Fields**: `selectedEditorId`, `availableEditors`, `campaigns`, `callerRole`.

**Validation**:
- Non-admin operators can only use their own user id as `selectedEditorId`.
- Admins can select any editor that has campaign assignments visible to the
  admin.
- Campaigns shown for a selected editor must all have
  `assignedOperatorId === selectedEditorId`.
- If no campaigns exist for the selected editor, the page shows an empty state
  and does not auto-select a different campaign.

**Relationships**: Filters the existing `Campaign` entity by
`assignedOperatorId` before the `CampaignEditorDraft` is opened.

## EditorContent

**Purpose**: The sanitized campaign body produced by toolbar-controlled rich text
editing.

**Fields**: `templateContent`, `sanitizationWarnings`, `updatedByUserId`,
`updatedAt`.

**Allowed Markup**:
- Tags: `strong`, `em`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `span`, `p`, `br`.
- Attributes: `style` on `span` only, restricted to approved `font-family`
  values: `Arial`, `Georgia`, `Times New Roman`, `Verdana`.
- Placeholders: `{{ value }}` tokens, where `value` is non-empty text inside the
  braces after trimming.

**Validation**:
- Unsupported tags, event attributes, scripts, inline styles outside the font
  allowlist, and unsafe URLs are removed or treated as plain text.
- The server repeats sanitization and validates the result even when the frontend
  already sanitized it.
- Invalid placeholder syntax such as `{Name}` or `{{Name` is reported during
  editor validation.

## PlaceholderValidationResult

**Purpose**: Shows whether the saved campaign body can be sent with available
recipient variables.

**Fields**: `campaignId`, `placeholders`, `recipients`, `canSend`, `createdAt`.

**Recipient Fields**: `contactId`, `availableVariables`, `missingVariables`,
`usesFallbackVariables`, `status`.

**Validation**:
- Built-in contact variables come from first-class contact fields such as
  `name` and `email`.
- Additional variables come from contact `personalizationData`.
- Campaign fallback variables may satisfy missing contact values according to
  feature-001 rules.
- Missing variables block normal send readiness until resolved.

## RecipientSendOutcome

**Purpose**: Presents per-recipient send status in the editor outcome panel.

**Fields**: `campaignId`, `contactId`, `contactEmail`, `contactName`,
`sendStatus`, `providerMessageId`, `lastAttemptAt`, `failureReason`,
`requiresReview`, `forceResendAllowed`, `retryFailedAllowed`.

**States**:
- `pending`: recipient has not been submitted yet.
- `submitted`: recipient was accepted/submitted to EmailLabs.
- `failed`: provider or validation failed before a confirmed submission.
- `uncertain`: timeout, network drop, worker crash, or partial response makes the
  provider state unknown.
- `force_resend_queued`: assigned operator acknowledged duplicate risk and a
  resend job was queued.

**Validation**:
- Automatic recovery can target only recipients that are safe to send without
  duplication.
- `failed` recipients expose `retryFailedAllowed` and can be queued for retry
  without duplicate-risk acknowledgement.
- `submitted` and `uncertain` recipients are never automatically sent again.
- `uncertain` recipients can be force-resent only by the assigned operator after
  explicit acknowledgement.

## ForceResendAcknowledgement

**Purpose**: Audits the operator decision to resend a recipient whose provider
state is uncertain.

**Fields**: `id`, `campaignId`, `contactId`, `acknowledgedByUserId`,
`acknowledgedDuplicateRisk`, `reason`, `createdAt`, `sendJobId`.

**Validation**:
- `acknowledgedDuplicateRisk` must be `true`.
- The recipient must currently be in an `uncertain` state.
- The caller must be an admin or the assigned campaign operator.
- The action enqueues worker processing asynchronously; it must not call
  EmailLabs during the HTTP request.

## CampaignEditorMcpRequest

**Purpose**: Describes MCP tool inputs for AI agents that need editor and
recovery access.

**Fields**: `campaignId`, `topic`, `templateContent`, `acknowledgedDuplicateRisk`,
`reason`.

**Validation**:
- MCP tools use the same OpenAPI-derived validation and authorization rules as
  HTTP endpoints.
- MCP tool responses must not expose provider secrets, auth secrets, or full
  sensitive logs.
