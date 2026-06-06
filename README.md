# Vercom Mailing Campaigns

Internal mailing campaign application for managing contacts, preparing
personalized campaigns, validating EmailLabs variables, queueing asynchronous
sends, and exposing equivalent API and MCP workflows.

## Services

- `backend`: Express API with OpenAPI-derived validation, authentication,
  authorization, and service-layer business logic.
- `frontend`: React application for contact and campaign operators.
- `worker`: asynchronous campaign sender that submits prepared work to EmailLabs.
- `mcp`: MCP host exposing automation tools that reuse service-layer validation.
- `db`: PostgreSQL storage accessed through Drizzle ORM only.

## Local Setup

```bash
cp .env.example .env
docker compose up --build
```

Required secrets must be placed only in `.env` or the deployment secret store.
Do not commit EmailLabs keys or bearer token secrets.

## Validation

```bash
npm run test --workspaces
npm run test:contract --workspace @vercom/backend
```

This repository intentionally uses unit and contract tests plus documented
quickstart/manual checks; no integration test suite is planned for spec 001.
