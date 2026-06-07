# Quickstart: Mailing Campaigns

## Prerequisites

- Docker with Docker Compose
- Node.js for local tooling when not running entirely in containers
- EmailLabs application key, secret key, SMTP account, and sender address for
  real send validation

## Environment

Create `.env` from the project example once implementation adds it. Required
settings:

```text
DATABASE_URL=postgres://vercom:vercom@db:5432/vercom
AUTH_TOKEN_SECRET=replace-with-local-secret
EMAILLABS_APPLICATION_KEY=replace-with-key
EMAILLABS_AUTHORIZATION=replace-with-secret-key
EMAILLABS_SMTP_ACCOUNT=1.your-panel.smtp
EMAILLABS_FROM_EMAIL=sender@example.com
EMAILLABS_API_BASE_URL=https://api.emaillabs.net.pl
```

## Run Locally

```bash
docker compose up --build
```

Expected services:

- `backend`: Express API
- `frontend`: React UI
- `worker`: asynchronous send worker
- `mcp`: MCP server for AI agent tools
- `db`: PostgreSQL

## Validate Core Flow

1. Run database migrations.
2. Seed one admin and two operators.
3. Log in as operator A and create a contact.
4. Attempt to create the same email again as operator A and confirm duplicate
   rejection.
5. Log in as operator B and create a contact with the same email, confirming it
   is accepted as a separate operator-owned contact.
6. Confirm operator B cannot view, edit, delete, select, or send to operator A's
   contact through the UI, API, or MCP tools.
7. Create a campaign assigned to operator A.
8. Add operator A's contact as a recipient.
9. Add a provider-compatible placeholder and fallback variables.
10. Validate recipient variables and approve send readiness.
11. Trigger send and confirm a send job is queued.
12. Confirm worker submits form-encoded `sendmail_templates` requests to
    EmailLabs in batches of no more than 200 recipients and records success or
    graceful failure.
13. Log in as operator B and confirm operator B cannot view, edit, or send
    operator A's campaign.
14. Log in as admin and confirm the admin can access all contacts and campaigns.
15. Repeat contact and campaign reads through the API and MCP tools.
16. Check primary forms at 375px, 768px, and 1440px widths and confirm controls
    do not overlap or clip text.

## Test Commands

```bash
npm run test --workspaces
npm run test:contract --workspace backend
```

## Acceptance

- OpenAPI-derived validation rejects invalid requests.
- No direct SQL appears in application code.
- Failed EmailLabs calls do not leak keys and do not duplicate sends.
- EmailLabs payloads use Basic auth and `to[email][vars][name]` form fields.
- Operators can access only their own contacts; admins can access all contacts.

## Implementation Validation Notes

- Unit and contract test files were added for auth, OpenAPI validation, contact
  validation, contact duplicate handling, campaign
  placeholders, variable validation, send eligibility, EmailLabs mapping, worker
  submission, MCP tool context, MCP authorization, and operator access.
- `npm run typecheck` passed on 2026-06-06.
- `npm run test --workspaces --if-present` passed on 2026-06-06.
- `npm run test:contract --workspace @vercom/backend` passed on 2026-06-06.
- Contact ownership, per-operator duplicate handling, admin contact visibility,
  recipient selection authorization, MCP contact authorization, EmailLabs
  form-url-encoded batching, and provider message ID mapping coverage were added
  on 2026-06-07.
- `npm run typecheck --workspaces --if-present` passed on 2026-06-07.
- `npm run test --workspaces --if-present` passed on 2026-06-07.
- `npm run test:contract --workspace @vercom/backend` passed on 2026-06-07.
- `docker compose up --build -d` started backend, frontend, worker, MCP server,
  and PostgreSQL on 2026-06-07 after `.env` was updated with local placeholder
  values for `EMAILLABS_SMTP_ACCOUNT` and `EMAILLABS_FROM_EMAIL`.
- Backend health responded with `{"ok":true}` and the frontend returned HTTP
  200 on 2026-06-07.
- Automated viewport checks at 375px, 768px, and 1440px were not run because no
  browser automation dependency or system browser is available in this
  environment. Manual/browser validation remains required before closing T106.
