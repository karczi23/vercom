# Feature Specification: Mailing Campaigns

**Feature Branch**: `001-mailing-campaigns`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "build an application that allows sending mailing campaigns to contacts that are stored in a database. its required to have CRUD capabilities and it should handle duplicates and incorrect data gracefully. it is required to have an API that exposes these features, and a web interface for humans to visually interact with the application. it is also required to have an mcp server that will expose functionalities to ai agents. it is required that campaigns can be personalized, for example by using placeholders like {Name}. sending actual emails will be handled by an external API"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Contacts (Priority: P1)

A human user manages a contact database by adding, viewing, editing, deleting,
searching, and correcting contacts through the web interface and programmable
interfaces.

**Why this priority**: Campaigns cannot be prepared or sent without reliable
contacts, and duplicate or invalid contact data directly affects campaign quality.

**Independent Test**: Create contacts, update them, delete them, search them, and
attempt invalid or duplicate entries. The system must preserve valid contacts and
return clear, recoverable feedback for duplicate or incorrect data.

**Acceptance Scenarios**:

1. **Given** a human user has valid contact details, **When** they create a
   contact, **Then** the contact appears in the contact list and can be retrieved
   through the exposed interfaces.
2. **Given** a human user submits contact details with invalid fields, **When**
   they save the contact, **Then** the system rejects the invalid fields with
   specific correction guidance and does not corrupt existing contacts.
3. **Given** a human user attempts to create or import a duplicate contact,
   **When** the duplicate is detected by email address, **Then** the system
   rejects the duplicate, preserves the existing contact, and explains which
   contact already uses that email address.

---

### User Story 2 - Create and Personalize Campaigns (Priority: P2)

A human user creates a mailing campaign, selects recipients, writes campaign
content, and defines EmailLabs-compatible placeholders before sending.

**Why this priority**: The application's core business value is preparing
targeted mailing campaigns that can use stored contact data.

**Independent Test**: Create a campaign, select contacts, insert placeholders,
verify required recipient variables before send, and confirm missing or invalid
personalization data is handled with owner-approved behavior before EmailLabs
receives the send request.

**Acceptance Scenarios**:

1. **Given** contacts exist with personalization fields, **When** a user creates
   a campaign using a supported placeholder, **Then** the system confirms the
   placeholder can be supplied to EmailLabs for each selected recipient.
2. **Given** a selected contact lacks data required by a placeholder, **When**
   the user validates the campaign before sending, **Then** the system applies
   configured fallback variables, highlights affected recipients, and requires
   approval before EmailLabs receives the send request.
3. **Given** campaign content contains an unsupported placeholder, **When** the
   user saves or previews the campaign, **Then** the system identifies the
   unsupported placeholder and explains how to correct it.

---

### User Story 3 - Send Campaigns Through External Delivery (Priority: P3)

A human user sends a prepared campaign, and the system submits the mailing work
to the external email delivery provider while tracking outcomes and failures.

**Why this priority**: Sending is the final value-producing action, but it depends
on reliable contacts and campaign preparation.

**Independent Test**: Send a campaign to a controlled recipient set, simulate
external delivery provider success and failure, and verify that campaign status,
recipient outcomes, and user-facing recovery guidance remain clear.

**Acceptance Scenarios**:

1. **Given** a campaign is valid and recipients are selected, **When** a user
   triggers sending, **Then** the system records the send attempt and submits the
   campaign to the external delivery provider.
2. **Given** the external delivery provider rejects or fails a request, **When**
   the send attempt completes, **Then** the system records the failed outcome,
   avoids duplicate unintended sends, and gives actionable recovery guidance.

---

### User Story 4 - Use API and MCP Interfaces (Priority: P4)

An API client or AI agent uses exposed interfaces to manage contacts, campaigns,
and sending workflows without using the web interface.

**Why this priority**: Automation and agent access are required, but they depend
on the same validated behavior as the human-facing flows.

**Independent Test**: Use the API and MCP server to perform the same contact,
campaign, personalization preview, and send-trigger operations available in the
web interface, including validation and error cases.

**Acceptance Scenarios**:

1. **Given** an authorized API client or AI agent has valid input, **When** it
   requests a supported contact or campaign operation, **Then** the system returns
   the same outcome and validation behavior available to human users.
2. **Given** an API client or AI agent submits invalid, duplicate, or incomplete
   data, **When** the request is processed, **Then** the response explains the
   correction needed without exposing sensitive details.
3. **Given** an operator accesses campaign functionality, **When** they view or
   modify campaigns, **Then** they can only access campaigns assigned to them and
   cannot edit campaigns owned by other operators.

### Edge Cases

- Duplicate contacts are submitted through different interfaces at nearly the
  same time.
- A contact contains malformed or missing email delivery fields.
- A campaign references unsupported placeholders or placeholders whose variables
  are missing from selected contact data.
- A contact is deleted after being selected for a campaign but before sending.
- The external email delivery provider times out, rejects a recipient, or returns
  a partial failure.
- A campaign send request is retried after an uncertain external-provider result.
- API and MCP callers submit data that is structurally valid but semantically
  incorrect for the campaign workflow.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow contacts to be created, viewed, searched,
  updated, and deleted through the web interface.
- **FR-002**: The system MUST expose contact CRUD capabilities through a
  programmable API.
- **FR-003**: The system MUST expose contact CRUD capabilities through an MCP
  server for AI agents.
- **FR-004**: The system MUST validate contact data before saving and return
  specific, recoverable correction guidance for incorrect data. Contact email
  and contact name are required.
- **FR-005**: The system MUST detect duplicate contacts using the owner-approved
  duplicate identity rule: email address only. Duplicate contact submissions
  MUST be rejected without modifying the existing contact.
- **FR-006**: The system MUST allow campaigns to be created, viewed, updated,
  deleted, and listed through the web interface.
- **FR-007**: The system MUST expose campaign CRUD capabilities through the API
  and MCP server.
- **FR-008**: The system MUST allow users to select campaign recipients from
  stored contacts.
- **FR-009**: The system MUST support campaign personalization placeholders that
  can be sent to EmailLabs with per-recipient variables.
- **FR-010**: The system MUST validate campaign placeholders and recipient
  variables before send without replacing placeholders itself.
- **FR-011**: The system MUST handle missing personalization data according to
  the owner-approved campaign safety policy: allow configured fallback variables,
  show affected recipients before send, and require approval before any messages
  are submitted to the external email provider.
- **FR-012**: The system MUST submit campaign send requests to an external email
  delivery provider and record the result for each campaign send attempt.
- **FR-013**: The system MUST fail gracefully when the external delivery provider
  is unavailable, rejects a request, or returns a partial result.
- **FR-014**: The system MUST prevent unintended duplicate sends when a send
  attempt is retried or its delivery outcome is uncertain.
- **FR-015**: The system MUST provide a web interface for humans to visually
  manage contacts, campaigns, personalization previews, and send outcomes.
- **FR-016**: The system MUST expose equivalent core capabilities through the API
  and MCP server, subject to the same validation and authorization rules.
- **FR-017**: The system MUST restrict access across web, API, and MCP surfaces
  using the owner-approved access model: admin and operator roles. Admins can
  manage all contacts, campaigns, settings, and access. Operators can manage
  contacts and only the campaigns assigned to them; operators MUST NOT edit
  campaigns assigned to other operators.
- **FR-018**: Every endpoint MUST validate input and output using rules derived
  from the OpenAPI specification.
- **FR-019**: External API failures MUST return a graceful result with actionable
  logging and no sensitive data leakage.
- **FR-020**: API and MCP requests made by operators MUST enforce the same
  assigned-campaign restrictions as the web interface.

### Key Entities *(include if feature involves data)*

- **Contact**: A stored recipient record with required email and name,
  optional personalization variables for EmailLabs placeholders, status,
  validation state, and duplicate-resolution history.
- **Campaign**: A mailing campaign with name, subject, one template content body,
  personalization placeholders, selected recipients, assigned operator ownership,
  lifecycle state, and send history.
- **Campaign Recipient**: The relationship between a campaign and a contact,
  including variable validation status and per-recipient delivery outcome.
- **Send Attempt**: A record of a campaign submission to the external delivery
  provider, including status, timestamps, failures, retry state, and provider
  response summary.
- **Interface Client**: A human user, API client, or AI agent acting through the
  web interface, API, or MCP server.
- **Access Role**: A permission profile for admins and operators, including the
  campaigns an operator is assigned to manage.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Human users can create, find, edit, and delete a contact in under
  2 minutes during usability testing.
- **SC-002**: At least 95% of invalid contact submissions return field-specific
  correction guidance without saving invalid data.
- **SC-003**: Duplicate contact attempts are detected and routed through the
  approved resolution behavior with no loss of the existing contact record.
- **SC-004**: Human users can create a personalized campaign, select recipients,
  validate required variables for at least three recipients, and initiate sending
  in under 10 minutes after contacts already exist.
- **SC-005**: API and MCP clients can complete the primary contact and campaign
  workflows with the same validation outcomes as the web interface.
- **SC-006**: External delivery provider failures produce a visible campaign
  status and recovery guidance for 100% of tested failure scenarios.
- **SC-007**: Operator access tests confirm that operators cannot view, edit, or
  send campaigns assigned to other operators across web, API, and MCP surfaces.

## Assumptions

- The application is for internal campaign operators and approved automation
  clients, not public self-service signup.
- Sending emails directly is out of scope; the system submits requests to an
  external delivery provider and tracks outcomes.
- Bulk contact import is not part of the initial scope unless explicitly added
  later.
- Campaign scheduling is not part of the initial scope unless explicitly added
  later.
- Contact and campaign data are retained until deleted by an authorized actor or
  by a future retention policy.

## Constitutional Considerations *(mandatory)*

- **User Value**: The highest-priority story delivers a usable contact database
  with recoverable validation and duplicate handling, enabling all later campaign
  workflows.
- **Verification**: Each story has an independent test path; major validation,
  duplicate detection, personalization, sending, and interface operations require
  automated coverage or documented manual validation.
- **OpenAPI/Validation**: API capabilities include contacts, campaigns,
  placeholder-variable validation, send requests, and send-status retrieval;
  endpoint validation must be derived from the OpenAPI contract.
- **Data/Security**: Contact and campaign data include personally identifying
  delivery information and campaign content. Admins can manage all records;
  operators can manage contacts and only their assigned campaigns across web,
  API, and MCP surfaces.
- **Async Communication**: Campaign sending and external delivery provider
  interaction must be handled asynchronously from user and agent requests, with
  status visible after submission.
- **External API Failure**: External delivery failures must be recorded, surfaced
  to users and agents, and handled without leaking sensitive details or causing
  unintended duplicate sends.
- **Operations**: The feature requires visible status tracking, actionable error
  messages, clear logs for failed external delivery, and separate runtime
  services for the application and database during implementation planning.
- **Unresolved Decisions**: N/A.
