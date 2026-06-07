# Implementation Plan: Campaign Editor

**Branch**: `002-campaign-editor` | **Date**: 2026-06-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-campaign-editor/spec.md`

## Summary

Build the CMS-like campaign editor as a focused extension to the mailing
campaigns application. The frontend uses React with a small WYSIWYG editor
library (`pell`) for toolbar-controlled rich text, DOMPurify with a strict
allowlist for sanitization, and spec-002 API deltas for editor save, validation,
preview, outcome review, and operator-acknowledged force resend. The backend
keeps Express, TypeScript strict mode, OpenAPI-derived validation, Drizzle ORM,
PostgreSQL, Vitest, existing operator assignment checks, and asynchronous send
recovery through the worker.

## Technical Context

**Language/Version**: TypeScript 5.x with `strict: true` for backend, frontend,
tests, and shared types

**Primary Dependencies**: Express.js, React, Vite, Drizzle ORM, PostgreSQL driver,
AJV, Vitest, Docker Compose, MCP TypeScript SDK, `pell` for the editor UI,
DOMPurify for browser sanitization, and DOMPurify with a Node DOM adapter for
backend sanitization

**Storage**: PostgreSQL with Drizzle ORM schema and migrations; no direct SQL
invocations in application code

**Testing**: Vitest for unit and contract tests; quickstart/manual validation for
browser editor behavior and provider failure review flows; no integration test
suite is planned

**Target Platform**: Containerized local and deployment runtime using Dockerfiles
and Docker Compose

**Project Type**: Web application with backend API, frontend UI, background
worker, database, and MCP server

**Performance Goals**: Editor screen opens with saved draft content in under 2
seconds on local development data; save, validate, and preview requests return
within 500ms p95 excluding network latency; toolbar actions apply immediately in
the browser

**Constraints**: Minimal libraries; OpenAPI is the source of truth for endpoint
validation; direct operator-authored HTML is forbidden; operators can only edit,
preview, send, recover, or force-resend campaigns assigned to them; automatic
recovery must never duplicate a successful or uncertain recipient submission

**Scale/Scope**: One campaign editor screen, focused API deltas, and MCP deltas
for agent access to the same editor/recovery capabilities. Bulk import,
scheduling, multi-step marketing automation, reusable design blocks, images, and
future editor extension are out of scope.

**API Contract**: `contracts/openapi-delta.yaml`; backend compiles request and
response schemas from OpenAPI with AJV. The delta extends the mailing campaigns
contract from feature 001 without redefining the full API.

**Rate Limits**: No feature-specific campaign editor rate limit is added.

**Async Communication**: Frontend and MCP/API calls use HTTP request/response as
the required protocol boundary for editor save, validation, preview, and status
reads. Send, recovery, and force-resend actions enqueue worker work and return
accepted/status responses without calling EmailLabs synchronously.

**External APIs**: The editor does not call EmailLabs directly. Existing worker
EmailLabs submission uses timeouts, bounded retries, recipient variables, failure
recording, and safe uncertain-outcome states. Force resend is allowed only for
uncertain recipients after an explicit duplicate-risk acknowledgement.

**Container Topology**: Separate backend API, frontend, worker, MCP server, and
PostgreSQL containers defined through Dockerfiles and Docker Compose.

**Clarifications**: Use a small editor library rather than a custom editor;
selected `pell` because the editor will not grow and selection/paste behavior
should not be hand-rolled. Use DOMPurify with a strict allowlist. Keep spec-002
contracts as API deltas only. Any syntactically valid `{{ value }}` placeholder
is allowed and validated before send. Operators may force resend uncertain
recipients after acknowledging possible duplication.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Spec-Led User Value**: PASS. `spec.md` contains prioritized user journeys,
  acceptance scenarios, measurable outcomes, explicit assumptions, and
  asynchronous send/recovery expectations. No unresolved decisions remain after
  the owner clarified editor dependency, sanitization, contract scope, placeholder
  catalog, and uncertain-send handling.
- **Minimal, Explicit Architecture**: PASS. This plan fixes TypeScript strict
  mode, Express, React, Drizzle, PostgreSQL, Docker Compose, `pell`, DOMPurify,
  runtime boundaries, and rejected alternatives in `research.md`.
- **Verifiable Increments**: PASS. Each story has independent verification;
  major functions require Vitest unit tests; OpenAPI contract behavior requires
  contract tests; browser-specific editor behavior is covered by quickstart
  validation because no integration test suite is planned.
- **Contract-Driven Security and Data Access**: PASS. OpenAPI plus AJV drives
  endpoint validation, Drizzle is the only persistence layer, operator
  assignment checks protect campaign ownership, and sanitization is explicit.
- **Operable, Containerized Systems**: PASS. API, frontend, worker, MCP server,
  and database run separately; send failures and uncertain outcomes are visible
  without logs; external provider failures are recorded without leaking secrets.
- **Pull Request and Commit Discipline**: PASS. Work is on feature branch
  `002-campaign-editor`; changes enter main only through owner-approved PRs.
- **Clarification Discipline**: PASS. No plan decision depends on unanswered
  behavior, data, API, security, architecture, test, container, or release
  workflow questions.

**Gate Result**: PASS

## Project Structure

### Documentation (this feature)

```text
specs/002-campaign-editor/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── openapi-delta.yaml
│   └── mcp-tools-delta.md
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
backend/
├── Dockerfile
├── src/
│   ├── api/
│   │   └── openapi-validation/
│   ├── campaign-editor/
│   │   ├── editor.controller.ts
│   │   ├── editor.service.ts
│   │   ├── editor.types.ts
│   │   ├── placeholder.service.ts
│   │   ├── sanitize.service.ts
│   │   └── send-recovery.service.ts
│   ├── campaigns/
│   ├── common/
│   ├── db/
│   ├── mcp/
│   └── worker/
└── tests/
    ├── contract/
    └── unit/

frontend/
├── Dockerfile
├── src/
│   ├── api/
│   ├── campaign-editor/
│   │   ├── CampaignEditorPage.tsx
│   │   ├── CampaignEditorToolbar.tsx
│   │   ├── CampaignPreview.tsx
│   │   ├── SendOutcomePanel.tsx
│   │   ├── campaignEditor.types.ts
│   │   └── sanitizePreview.ts
│   ├── campaigns/
│   └── common/
└── tests/
    └── unit/

common/
└── types/
    └── campaign-editor.ts

docker-compose.yml
```

**Structure Decision**: Extend the feature-001 web application layout with
focused `campaign-editor` modules. Types used only by the backend or frontend
stay next to the code that uses them; cross-concern DTOs and shared status types
live in `common/types/campaign-editor.ts`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
