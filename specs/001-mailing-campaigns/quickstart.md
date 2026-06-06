# Quickstart: Mailing Campaigns

## Prerequisites

- Docker with Docker Compose
- Node.js for local tooling when not running entirely in containers
- EmailLabs application key and authorization key for real send validation

## Environment

Create `.env` from the project example once implementation adds it. Required
settings:

```text
DATABASE_URL=postgres://vercom:vercom@db:5432/vercom
AUTH_TOKEN_SECRET=replace-with-local-secret
EMAILLABS_APPLICATION_KEY=replace-with-key
EMAILLABS_AUTHORIZATION=replace-with-key
EMAILLABS_API_BASE_URL=https://api.emaillabs.net.pl
```

## Run Locally

```bash
docker compose up --build
```

Expected services:

- `backend`: Express API and MCP endpoint host
- `frontend`: React UI
- `worker`: asynchronous send worker
- `db`: PostgreSQL

## Validate Core Flow

1. Run database migrations.
2. Seed one admin and two operators.
3. Log in as admin and create a contact.
4. Attempt to create the same email again and confirm duplicate rejection.
5. Create a campaign assigned to operator A.
6. Add the contact as a recipient.
7. Add a provider-compatible placeholder and fallback variables.
8. Validate recipient variables and approve send readiness.
9. Trigger send and confirm a send job is queued.
10. Confirm worker submits template variables to EmailLabs and records success
    or graceful failure.
11. Log in as operator B and confirm operator B cannot view, edit, or send
    operator A's campaign.
12. Repeat contact and campaign reads through the API and MCP tools.

## Test Commands

```bash
npm run test --workspaces
npm run test:contract --workspace backend
```

## Acceptance

- OpenAPI-derived validation rejects invalid requests.
- API returns a clear retry response above 10 requests/minute.
- No direct SQL appears in application code.
- Failed EmailLabs calls do not leak keys and do not duplicate sends.

## Implementation Validation Notes

- Unit and contract test files were added for auth, rate limiting, OpenAPI
  validation, contact validation, contact duplicate handling, campaign
  placeholders, variable validation, send eligibility, EmailLabs mapping, worker
  submission, MCP tool context, MCP authorization, and operator access.
- `npm run typecheck` passed on 2026-06-06.
- `npm run test --workspaces --if-present` passed on 2026-06-06.
- `npm run test:contract --workspace @vercom/backend` passed on 2026-06-06.
- Docker is installed, but this user cannot connect to `/var/run/docker.sock`, so
  `docker compose up --build -d` could not start services in this environment.
  Docker Compose startup and full quickstart runtime validation remain required
  from a shell with Docker socket access.
