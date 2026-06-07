# Quickstart: Campaign Editor

## Prerequisites

- Feature 001 application structure exists with backend, frontend, worker, MCP
  server, PostgreSQL, OpenAPI-derived validation, Drizzle ORM, and Docker Compose.
- Dependencies include `pell` and DOMPurify in the frontend package, plus
  DOMPurify with a Node DOM adapter in the backend package.
- The backend has access to the generated OpenAPI validators for
  `contracts/openapi-delta.yaml`.

## Run

```bash
docker compose up --build
```

Open the frontend URL from Docker Compose and sign in as an operator assigned to
a test campaign.

## Validate User Story 1: Compose Campaign Content

1. Open the main campaign page.
2. Select an editor/operator from the assigned-editor selector.
3. Confirm the campaign list only shows campaigns assigned to the selected
   editor.
4. Open the campaign editor for one listed assigned draft campaign.
5. Enter a topic.
6. Enter body content containing `{{ Name }}` and another placeholder such as
   `{{ company }}`.
7. Use the toolbar to apply bold, italic, headings 1-6, and each approved font.
8. Save the draft, reopen it, and confirm formatting and placeholders remain.
9. Run unit tests for assigned campaign selection, placeholder extraction,
   editor DTO validation, and draft
   save service behavior.

Expected result: the draft stores one sanitized `templateContent` value with
allowed generated HTML and preserved placeholders.

## Validate User Story 2: Reject Unsafe HTML Authoring

1. Type `<h1>Hello</h1>` directly into the editor content.
2. Paste content containing `<script>`, event attributes, unsupported inline
   styles, and unsupported tags.
3. Save and preview the campaign.
4. Confirm direct HTML is preserved only as plain sanitized text or removed when
   unsafe, and toolbar-generated formatting still renders.
5. Run unit tests for sanitization allowlist behavior on both frontend preview
   helpers and backend save/preview services.

Expected result: direct operator-authored HTML is never interpreted as markup.

## Validate User Story 3: Prevent Duplicate Sends During Failures

1. Create recipients with valid variables and queue a campaign send.
2. Simulate outcome rows for `submitted`, `failed`, `pending`, and `uncertain`.
3. Open the send outcome panel and confirm each status is visually distinct.
4. Trigger automatic recovery and confirm only safe recipients are queued.
5. Attempt force resend for a submitted recipient and confirm it is rejected.
6. Force resend an uncertain recipient with `acknowledgedDuplicateRisk: true`.
7. Confirm the acknowledgement is recorded and a worker job is queued
   asynchronously.
8. Run unit tests for recovery eligibility, force-resend validation, assignment
   authorization, and concurrent recovery attempts.

Expected result: automatic recovery never resubmits successful or uncertain
recipients, while assigned operators can explicitly force resend uncertain
recipients after acknowledgement.

## Contract Validation

```bash
npm run test -- --run
```

Required contract coverage:
- Editor save rejects invalid request bodies through OpenAPI-derived validation.
- Preview returns sanitized HTML and placeholders.
- Validation returns missing variables per recipient.
- Outcome list is scoped by campaign assignment.
- Force resend requires `acknowledgedDuplicateRisk: true` and an uncertain
  recipient state.

## Manual Non-Regression Checks

- Operators cannot access another operator's campaign editor.
- MCP tools expose the same authorization and validation behavior as HTTP.
- No EmailLabs request is made during editor save, preview, validation, or force
  resend HTTP handling; sends happen through queued worker jobs.

## Validation Results

Recorded on 2026-06-07:

- `npm run typecheck`: PASS
- `npm run test`: PASS, 37 test files and 56 tests
- `npm run build`: PASS
- Source checks: PASS for OpenAPI-derived editor validation through the shared
  OpenAPI document, assigned-operator authorization, no direct SQL in
  `backend/src/campaign-editor`, and no EmailLabs call in editor/recovery HTTP or
  MCP code paths.

Manual browser/container validation remains the follow-up for visual editor
behavior in a real browser and Docker Compose runtime.
