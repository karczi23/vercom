# Implementation Plan: Mailing Campaigns

**Branch**: `001-mailing-campaigns` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-mailing-campaigns/spec.md`

## Summary

Build a TypeScript mailing campaign application with an Express backend, React
frontend, PostgreSQL storage through Drizzle ORM, OpenAPI-derived validation,
MCP tools for agents, and asynchronous campaign sending through EmailLabs. The
plan stores contacts, campaigns, assigned operator access, variable validation
state, send jobs, send attempts, and external-provider outcomes while keeping
dependencies minimal.
EmailLabs is responsible for placeholder substitution during template sending;
Vercom validates required variables and duplicate-send safety before submission.

## Technical Context

**Language/Version**: TypeScript 5.x with `strict: true` for backend, frontend,
tests, and shared type packages

**Primary Dependencies**: Express.js, React, Vite, Tailwind CSS, Drizzle ORM,
PostgreSQL driver, AJV, Argon2id password hashing, Vitest, Docker Compose, MCP
TypeScript SDK

**Storage**: PostgreSQL with Drizzle ORM schema and Drizzle migrations; no direct
SQL invocations in application code

**Testing**: Vitest for unit and contract tests; quickstart/manual validation for
end-to-end campaign flows

**Target Platform**: Containerized local and deployment runtime using Dockerfiles
and Docker Compose

**Project Type**: Web application with backend API, frontend UI, background worker,
database, and MCP server

**Performance Goals**: Human contact CRUD in under 2 minutes; campaign preparation
in under 10 minutes after contacts exist; primary forms remain readable and
usable on common desktop and mobile viewport widths

**Constraints**: Minimal libraries; OpenAPI is source of truth for endpoint
validation; operators can only access assigned campaigns; external email failures
must not leak secrets or cause duplicate sends; login must verify stored user
password hashes; OpenAPI validation helpers must remain small and readable

**Scale/Scope**: Initial internal application for admins, operators, API clients,
and approved MCP agents; bulk import and scheduled campaigns remain out of scope

**API Contract**: `contracts/openapi.yaml`; backend compiles request and response
schemas from OpenAPI with AJV

**Synchronous Boundaries**: Web, API, and MCP contact/campaign CRUD,
authentication, validation, and read operations use request/response interactions
because callers need immediate validation, authorization, and saved-record
feedback. Failures return structured validation, authorization, or safe error
responses. Campaign sending remains asynchronous through queued send jobs.

**Async Communication**: PostgreSQL-backed send jobs processed by a backend worker
container; user/API/MCP send requests enqueue work and return status

**External APIs**: EmailLabs `POST /api/sendmail_templates` with
`application/x-www-form-urlencoded` request bodies, Basic authentication from the
configured application key and secret key, `smtp_account`, `from`, `subject`,
`template_id` or inline content, `to[email][vars][name]` recipient variables,
200-recipient request batches, request timeout, bounded retries, provider
message-id mapping, and recorded failure states

**Container Topology**: Separate backend API, frontend, worker, and PostgreSQL
containers defined with Dockerfiles and Docker Compose

**Clarifications**: Duplicate contacts use email-only rejection; EmailLabs
performs placeholder replacement from form-encoded `sendmail_templates` variables
supplied by Vercom; missing placeholder data uses fallback variables plus
approval; access uses admin and operator roles; operators are restricted to
assigned campaigns; auth uses short-lived bearer access tokens without token
revocation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Spec-Led User Value**: PASS. `spec.md` contains prioritized independently
  testable user stories, acceptance scenarios, success criteria, assumptions, and
  async sending expectations. No unresolved decisions remain.
- **Minimal, Explicit Architecture**: PASS. This plan fixes Express, React,
  TypeScript strict mode, Drizzle, PostgreSQL, Docker Compose containers, and
  rejected alternatives in `research.md`.
- **Verifiable Increments**: PASS. Each story has an independent test path; unit,
  contract, and quickstart validation are required.
- **Contract-Driven Security and Data Access**: PASS. OpenAPI plus AJV drives
  endpoint validation, Drizzle is the only persistence layer, and access
  restrictions are explicit.
- **Operable, Containerized Systems**: PASS. API, frontend, worker, and database
  run in separate containers; EmailLabs failures are recorded and surfaced.
- **Pull Request and Commit Discipline**: PASS. Work is on feature branch
  `001-mailing-campaigns`; changes enter main only through owner-approved PRs.
- **Clarification Discipline**: PASS. Owner answers are incorporated into
  `spec.md` and this plan; no plan decision depends on unanswered questions.

**Gate Result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-mailing-campaigns/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── openapi.yaml
│   └── mcp-tools.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
backend/
├── Dockerfile
├── src/
│   ├── api/
│   ├── auth/
│   ├── campaigns/
│   ├── contacts/
│   ├── common/
│   ├── db/
│   ├── email-labs/
│   ├── mcp/
│   └── worker/
└── tests/
    ├── contract/
    └── unit/

frontend/
├── Dockerfile
├── src/
│   ├── api/
│   ├── auth/
│   ├── campaigns/
│   ├── contacts/
│   ├── common/
│   ├── layout/
│   └── styles/
└── tests/
    └── unit/

common/
└── types/

docker-compose.yml
```

**Structure Decision**: Use separate `backend`, `frontend`, and `common/types`
directories. Types used only by one concern stay near that concern; cross-concern
DTOs and shared enum-like types live in `common/types`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
