# Feature Specification: Campaign Editor

**Feature Branch**: `002-campaign-editor`

**Created**: 2026-06-06

**Status**: Draft

**Input**: User description: "Campaigns should be defined in CMS-like screen in frontend application, where the operator describes the topic, content of the email (with the possibility to use placeholders). These placeholders should look this: `{{ placeholder }}`. Content should be using rich text - bold, italics, using headings 1-6 and selecting font from a predefined short list are available. These are styled using buttons on top of the textarea in editor. Using HTML elements directly is forbidden and is sent as plain sanitized text. Errors such as failing to send all/some mails should be handled in a way that the application should never send duplicate mails that are part of the same campaign."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compose Campaign Content (Priority: P1)

An operator creates or edits a campaign in a CMS-like screen by entering a topic,
writing email content, applying supported formatting from toolbar buttons, and
using placeholders such as `{{ Name }}` that EmailLabs will replace during
sending.

**Why this priority**: Operators need a safe, visual campaign authoring workflow
before campaign previews or sending can be trusted.

**Independent Test**: Create a campaign draft, enter topic and body content, add
valid placeholders, apply bold, italic, heading, and font controls from the
toolbar, save the draft, reopen it, and confirm the content and formatting are
preserved as allowed generated HTML without accepting operator-authored HTML.

**Acceptance Scenarios**:

1. **Given** an operator opens the campaign editor, **When** they enter a topic
   and body text, **Then** the campaign draft stores both values and shows them
   when reopened.
2. **Given** an operator selects text in the editor, **When** they use the bold,
   italic, heading, or font toolbar controls, **Then** the selected text displays
   the chosen formatting in the editor and preview.
3. **Given** an operator inserts a placeholder using the `{{ placeholder }}`
   syntax, **When** the campaign is validated before send, **Then** the
   placeholder is recognized as an EmailLabs variable token instead of ordinary
   text.
4. **Given** an operator types any placeholder in the `{{ value }}` form,
   **When** the campaign is saved, **Then** the placeholder is allowed and later
   validated against recipient variables before send.

---

### User Story 2 - Reject Unsafe HTML Authoring (Priority: P2)

An operator attempts to type or paste HTML into campaign content, and the editor
keeps the content safe by treating those HTML elements as sanitized plain text
instead of executable or rendered markup, while toolbar actions may generate only
approved HTML for supported formatting.

**Why this priority**: Campaign content must be safe for operators, recipients,
and downstream delivery systems, while still allowing controlled rich-text
formatting in final emails.

**Independent Test**: Paste visible HTML tags and script-like content into the
editor, save the draft, preview it, and confirm the tags are displayed or sent as
plain sanitized text and never interpreted as operator-authored HTML.

**Acceptance Scenarios**:

1. **Given** an operator types `<h1>Hello</h1>` into the editor body, **When**
   the draft is saved and previewed, **Then** the literal text is preserved as
   sanitized text and is not interpreted as an HTML heading.
2. **Given** an operator pastes script-like or HTML attribute content, **When**
   the campaign is saved or previewed, **Then** unsafe markup behavior is removed
   and the operator receives clear feedback that direct HTML is not supported.

---

### User Story 3 - Prevent Duplicate Sends During Failures (Priority: P3)

An operator sends a campaign and the delivery provider reports full or partial
failures, while the application guarantees that no recipient receives a duplicate
email from the same campaign because of retries or recovery actions.

**Why this priority**: Failure recovery is required, but duplicate sends from the
same campaign are more harmful than delayed delivery.

**Independent Test**: Simulate full failure, partial failure, timeout, and retry
scenarios. Confirm already-submitted recipients are not submitted again for the
same campaign, while unsent or failed recipients remain visible for safe recovery.

**Acceptance Scenarios**:

1. **Given** a campaign send partially succeeds, **When** the operator retries
   recovery, **Then** only recipients that were not successfully submitted are
   eligible for another send attempt.
2. **Given** a send result is uncertain, **When** the system cannot prove whether
   a recipient was submitted, **Then** the recipient is marked for operator review
   and is not automatically sent again.
3. **Given** a send result is uncertain, **When** the assigned operator decides
   delivery is more important than possible duplication, **Then** they can
   explicitly force a resend for that recipient after acknowledging duplicate
   risk.
4. **Given** an operator views send outcomes, **When** some recipients failed,
   **Then** the interface clearly separates successful, failed, pending, and
   review-required recipients.

### Edge Cases

- The operator types unsupported placeholder syntax such as `{Name}` or
  `{{Name` in the editor.
- The operator inserts a supported placeholder inside bold, italic, heading, or
  font-formatted content.
- The operator applies multiple supported styles to the same text selection.
- The operator changes a heading level or font after a campaign has been saved.
- The operator pastes HTML elements, inline styles, scripts, or event attributes
  into the editor.
- A campaign send times out after the external provider receives some recipient
  submissions.
- A campaign recovery action is triggered twice from different browser sessions.
- An operator attempts to edit or resend a campaign assigned to another operator.
- An operator force-resends a recipient with uncertain provider outcome and the
  recipient receives a duplicate email for the same campaign.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a CMS-like campaign editor screen in the
  frontend application for operators.
- **FR-002**: The campaign editor MUST allow operators to define a campaign topic.
- **FR-003**: The campaign editor MUST allow operators to write campaign email
  content in a textarea-like editing area.
- **FR-004**: The campaign editor MUST support personalization placeholders only
  in the `{{ placeholder }}` format and MUST preserve those placeholders for
  EmailLabs to replace during sending.
- **FR-005**: The system MUST allow any placeholder name inside valid
  `{{ value }}` syntax and validate variable availability before send.
- **FR-006**: The editor toolbar MUST provide buttons for bold and italic
  formatting.
- **FR-007**: The editor toolbar MUST provide heading controls for heading levels
  1 through 6.
- **FR-008**: The editor toolbar MUST provide font selection from a predefined
  short list containing Arial, Georgia, Times New Roman, and Verdana.
- **FR-009**: The system MUST preserve supported rich-text formatting as allowed
  generated HTML when a campaign draft is saved, reopened, previewed, and sent.
- **FR-010**: The system MUST forbid direct HTML authoring in campaign content.
- **FR-011**: Any HTML elements typed or pasted into campaign content MUST be
  treated as sanitized plain text and MUST NOT be interpreted as markup.
- **FR-012**: Toolbar controls MAY generate only the approved HTML needed for
  supported bold, italic, heading, and font formatting.
- **FR-013**: The campaign preview MUST show supported formatting and placeholder
  positions, while making clear that final placeholder replacement is performed
  by EmailLabs during sending.
- **FR-014**: The system MUST track send state per recipient within a campaign.
- **FR-015**: The system MUST NOT automatically submit an email more than once to
  the same recipient for the same campaign after a successful or uncertain
  submission.
- **FR-016**: Assigned operators MAY explicitly force resend for recipients with
  uncertain provider outcome after acknowledging duplicate risk.
- **FR-017**: When a send attempt fully or partially fails, the system MUST show
  which recipients succeeded, failed, are pending, or require operator review.
- **FR-018**: Automatic recovery or retry actions MUST only target recipients
  that are safe to send without creating duplicate campaign emails.
- **FR-019**: Operator campaign assignment restrictions from the mailing
  campaigns feature MUST apply to editing, previewing, sending, and recovery
  actions in this editor.

### Key Entities *(include if feature involves data)*

- **Campaign Draft**: Editable campaign definition containing topic, content,
  supported formatting, placeholders, assigned operator, and draft state.
- **Editor Content**: Sanitized campaign content with controlled rich-text
  formatting stored as allowed generated HTML, EmailLabs placeholder tokens, and
  direct HTML preserved only as plain text.
- **Toolbar Formatting**: Supported formatting choices available through editor
  controls: bold, italic, headings 1-6, and predefined font options.
- **Recipient Send State**: Per-campaign, per-recipient status that prevents
  duplicate sends and supports safe recovery after failures.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Operators can create and save a campaign topic and rich-text body
  in under 5 minutes during usability testing.
- **SC-002**: 100% of supported toolbar formatting controls persist after save,
  reopen, preview, and send preparation in acceptance testing.
- **SC-003**: 100% of direct HTML authoring attempts are treated as sanitized
  plain text and are never interpreted as executable or rendered markup.
- **SC-004**: 100% of valid `{{ value }}` placeholders are preserved for
  EmailLabs replacement, and missing recipient variables are identified before
  send.
- **SC-005**: Failure recovery tests confirm no recipient receives duplicate
  submissions automatically for the same campaign across full failure, partial
  failure, timeout, and concurrent retry scenarios.
- **SC-006**: Operators can identify successful, failed, pending, and
  review-required recipients from the send outcome view without inspecting logs.
- **SC-007**: Assigned operators can force resend for uncertain recipients only
  after an explicit duplicate-risk acknowledgement.

## Assumptions

- The editor is part of the existing campaign management workflow and inherits
  admin/operator access rules from the mailing campaigns feature.
- Supported formatting is limited to toolbar-controlled bold, italic, heading,
  and font selection for this feature.
- Raw HTML input is not a supported authoring workflow, even for admins.
- Placeholder values are sent to EmailLabs as recipient variables from contact
  personalization data defined by the broader mailing campaigns feature.
- Any syntactically valid `{{ value }}` placeholder is allowed in the editor;
  missing values are handled during pre-send variable validation.

## Constitutional Considerations *(mandatory)*

- **User Value**: The highest-priority story lets operators safely define
  campaign topic, content, formatting, and placeholders in a visual editor.
- **Verification**: Editor formatting, placeholder syntax, variable validation,
  HTML sanitization, automatic duplicate-send prevention, and operator force
  resend acknowledgement require automated coverage and manual preview
  validation.
- **OpenAPI/Validation**: Campaign content and send-recovery endpoints must
  validate supported formatting, EmailLabs placeholder syntax, available
  recipient variables, and recipient send-state transitions through
  OpenAPI-derived rules.
- **Data/Security**: Direct HTML authoring is forbidden; pasted or typed HTML is
  sanitized and treated as plain text. Toolbar-generated formatting uses only
  approved HTML. Operator campaign assignment restrictions remain mandatory.
- **Rate Limiting**: Campaign editor endpoints do not add feature-specific rate
  limiting.
- **Async Communication**: Send and recovery actions remain asynchronous and are
  driven by per-recipient send state.
- **External API Failure**: Partial and uncertain provider outcomes must never
  cause automatic duplicate submissions for the same campaign recipient. Assigned
  operators can explicitly force resend after acknowledging duplicate risk.
- **Operations**: Send outcome visibility must make full failure, partial
  failure, pending, and review-required states clear without requiring log
  inspection.
- **Unresolved Decisions**: N/A.
