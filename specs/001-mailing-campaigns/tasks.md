# Tasks: Mailing Campaigns

**Input**: Design documents from `/specs/001-mailing-campaigns/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), [contracts/openapi.yaml](./contracts/openapi.yaml), [contracts/mcp-tools.md](./contracts/mcp-tools.md)

**Tests**: Unit tests are required for every major function. Contract tests are
required for OpenAPI-derived endpoint validation. End-to-end campaign flows use
quickstart/manual validation; no integration test suite is planned.

**Organization**: Tasks are grouped by user story so each story can be
implemented and verified independently after the shared foundation is complete.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the strict TypeScript monorepo, runtime containers, and
baseline commands used by every story.

- [ ] T001 Create workspace package configuration in `package.json`
- [ ] T002 Create strict TypeScript base configuration in `tsconfig.base.json`
- [ ] T003 Create backend package configuration in `backend/package.json`
- [ ] T004 [P] Create frontend package configuration in `frontend/package.json`
- [ ] T005 [P] Create common types package configuration in `common/package.json`
- [ ] T006 Create backend strict TypeScript configuration in `backend/tsconfig.json`
- [ ] T007 [P] Create frontend strict TypeScript configuration in `frontend/tsconfig.json`
- [ ] T008 [P] Create common strict TypeScript configuration in `common/tsconfig.json`
- [ ] T009 Configure Vitest workspace commands in `vitest.workspace.ts`
- [ ] T010 Create backend Dockerfile in `backend/Dockerfile`
- [ ] T011 [P] Create frontend Dockerfile in `frontend/Dockerfile`
- [ ] T012 Create Docker Compose topology for backend, frontend, worker, MCP server, and PostgreSQL in `docker-compose.yml`
- [ ] T013 Create environment example with non-secret placeholders in `.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared infrastructure that all user stories depend on.

**CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T014 Define shared role, pagination, error, and identifier types in `common/types/shared.ts`
- [ ] T015 Define shared contact, campaign, recipient, send job, and send attempt types in `common/types/mailing-campaigns.ts`
- [ ] T016 Add OpenAPI contract file to backend validation source in `backend/src/api/openapi.yaml`
- [ ] T017 Implement OpenAPI schema loading and AJV validator compilation in `backend/src/api/openapi-validation/openapiValidator.ts`
- [ ] T018 [P] Add contract tests for OpenAPI request and response validation in `backend/tests/contract/openapiValidation.test.ts`
- [ ] T019 Implement Express application bootstrap and JSON error boundary in `backend/src/api/app.ts`
- [ ] T020 Implement typed route registration in `backend/src/api/routes.ts`
- [ ] T021 Implement safe API error response helpers in `backend/src/common/apiErrors.ts`
- [ ] T022 Implement environment configuration loader in `backend/src/common/config.ts`
- [ ] T023 Configure Drizzle PostgreSQL connection in `backend/src/db/client.ts`
- [ ] T024 Define Drizzle schema for users, contacts, campaigns, campaign recipients, send jobs, send attempts, and rate limits in `backend/src/db/schema.ts`
- [ ] T025 Create initial Drizzle migration for all feature-001 tables in `backend/src/db/migrations/0001_initial.ts`
- [ ] T026 Implement password hashing utilities with Argon2id in `backend/src/auth/passwordHash.ts`
- [ ] T027 Implement short-lived bearer token signing and verification in `backend/src/auth/tokenService.ts`
- [ ] T028 [P] Add unit tests for password hashing and token verification in `backend/tests/unit/auth.test.ts`
- [ ] T029 Implement authentication middleware in `backend/src/auth/authMiddleware.ts`
- [ ] T030 Implement role and assigned-campaign authorization helpers in `backend/src/auth/authorization.ts`
- [ ] T031 Implement 10 requests/minute rate limiter using Drizzle ORM in `backend/src/rate-limit/rateLimitMiddleware.ts`
- [ ] T032 [P] Add unit tests for caller-key derivation and rate-limit windows in `backend/tests/unit/rateLimit.test.ts`
- [ ] T033 Implement frontend API client with bearer token support in `frontend/src/api/client.ts`
- [ ] T034 Implement frontend auth state handling in `frontend/src/auth/authStore.ts`
- [ ] T035 Implement backend startup entrypoint in `backend/src/api/server.ts`
- [ ] T036 Implement worker startup entrypoint in `backend/src/worker/worker.ts`
- [ ] T037 Implement MCP server startup entrypoint in `backend/src/mcp/server.ts`

**Checkpoint**: Foundation ready. User story implementation can now proceed.

---

## Phase 3: User Story 1 - Manage Contacts (Priority: P1) MVP

**Goal**: Human users can create, view, search, update, delete, validate, and
recover from duplicate contact submissions through the web interface and shared
backend behavior.

**Independent Test**: Create contacts, update them, delete them, search them,
submit invalid data, and submit duplicate emails. Valid records remain intact and
errors provide field-specific correction guidance.

### Tests and Validation for User Story 1

- [ ] T038 [P] [US1] Add unit tests for contact normalization and validation in `backend/tests/unit/contacts/contactValidation.test.ts`
- [ ] T039 [P] [US1] Add unit tests for duplicate email handling in `backend/tests/unit/contacts/contactService.test.ts`
- [ ] T040 [P] [US1] Add contract tests for contact CRUD OpenAPI validation in `backend/tests/contract/contacts.contract.test.ts`
- [ ] T041 [P] [US1] Add frontend unit tests for contact form validation feedback in `frontend/tests/unit/contacts/ContactForm.test.tsx`
- [ ] T042 [US1] Add manual validation checklist for contact CRUD in `specs/001-mailing-campaigns/quickstart.md`

### Implementation for User Story 1

- [ ] T043 [P] [US1] Implement contact validation and email normalization in `backend/src/contacts/contactValidation.ts`
- [ ] T044 [US1] Implement contact repository with Drizzle ORM only in `backend/src/contacts/contactRepository.ts`
- [ ] T045 [US1] Implement contact service with duplicate rejection behavior in `backend/src/contacts/contactService.ts`
- [ ] T046 [US1] Implement contact API routes for list, create, get, update, and delete in `backend/src/contacts/contactRoutes.ts`
- [ ] T047 [US1] Register contact routes and OpenAPI validators in `backend/src/api/routes.ts`
- [ ] T048 [P] [US1] Implement frontend contact API methods in `frontend/src/contacts/contactApi.ts`
- [ ] T049 [P] [US1] Implement contacts list and search view in `frontend/src/contacts/ContactsPage.tsx`
- [ ] T050 [US1] Implement contact create/edit form with field-specific errors in `frontend/src/contacts/ContactForm.tsx`
- [ ] T051 [US1] Implement contact delete confirmation flow in `frontend/src/contacts/DeleteContactDialog.tsx`
- [ ] T052 [US1] Wire contacts navigation into application layout in `frontend/src/layout/AppLayout.tsx`

**Checkpoint**: User Story 1 is independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Create and Personalize Campaigns (Priority: P2)

**Goal**: Users can create campaigns, assign operators, select recipients, define
EmailLabs-compatible placeholders, validate recipient variables, and approve
fallback-variable usage before send.

**Independent Test**: Create a campaign, select contacts, insert placeholders,
validate variables, confirm fallback usage, reject unsupported placeholders, and
verify EmailLabs has not been called.

### Tests and Validation for User Story 2

- [ ] T053 [P] [US2] Add unit tests for placeholder extraction and unsupported placeholder detection in `backend/tests/unit/campaigns/placeholderValidation.test.ts`
- [ ] T054 [P] [US2] Add unit tests for recipient variable and fallback validation in `backend/tests/unit/campaigns/variableValidation.test.ts`
- [ ] T055 [P] [US2] Add contract tests for campaign CRUD, recipients, and variable validation endpoints in `backend/tests/contract/campaigns.contract.test.ts`
- [ ] T056 [P] [US2] Add frontend unit tests for campaign form, recipient selection, and variable warnings in `frontend/tests/unit/campaigns/CampaignEditor.test.tsx`
- [ ] T057 [US2] Add manual validation checklist for campaign personalization in `specs/001-mailing-campaigns/quickstart.md`

### Implementation for User Story 2

- [ ] T058 [P] [US2] Implement campaign validation and lifecycle rules in `backend/src/campaigns/campaignValidation.ts`
- [ ] T059 [P] [US2] Implement placeholder extraction and validation in `backend/src/campaigns/placeholderService.ts`
- [ ] T060 [US2] Implement campaign repository with Drizzle ORM only in `backend/src/campaigns/campaignRepository.ts`
- [ ] T061 [US2] Implement campaign recipient repository with Drizzle ORM only in `backend/src/campaigns/campaignRecipientRepository.ts`
- [ ] T062 [US2] Implement campaign service for CRUD, assignment, recipient replacement, and draft mutation rules in `backend/src/campaigns/campaignService.ts`
- [ ] T063 [US2] Implement variable validation service using contact fields, personalization data, and fallback variables in `backend/src/campaigns/variableValidationService.ts`
- [ ] T064 [US2] Implement campaign API routes for CRUD, recipient selection, and variable validation in `backend/src/campaigns/campaignRoutes.ts`
- [ ] T065 [US2] Register campaign routes and OpenAPI validators in `backend/src/api/routes.ts`
- [ ] T066 [P] [US2] Implement frontend campaign API methods in `frontend/src/campaigns/campaignApi.ts`
- [ ] T067 [P] [US2] Implement campaign list view scoped by caller permissions in `frontend/src/campaigns/CampaignsPage.tsx`
- [ ] T068 [US2] Implement campaign create/edit form in `frontend/src/campaigns/CampaignForm.tsx`
- [ ] T069 [US2] Implement recipient selection UI in `frontend/src/campaigns/RecipientSelector.tsx`
- [ ] T070 [US2] Implement variable validation and fallback approval UI in `frontend/src/campaigns/VariableValidationPanel.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently; campaign
preparation is complete without sending.

---

## Phase 5: User Story 3 - Send Campaigns Through External Delivery (Priority: P3)

**Goal**: Users can queue a valid campaign send, the worker submits recipient
variables to EmailLabs asynchronously, and failures are recorded without leaking
secrets or causing unintended duplicate sends.

**Independent Test**: Queue a valid campaign, simulate EmailLabs success,
failure, timeout, and partial failure, then verify campaign status, recipient
outcomes, send attempts, and recovery guidance.

### Tests and Validation for User Story 3

- [ ] T071 [P] [US3] Add unit tests for send eligibility and duplicate-send prevention in `backend/tests/unit/worker/sendEligibility.test.ts`
- [ ] T072 [P] [US3] Add unit tests for EmailLabs request mapping and secret-safe error summaries in `backend/tests/unit/email-labs/emailLabsClient.test.ts`
- [ ] T073 [P] [US3] Add unit tests for send job claiming, retry limits, and uncertain outcomes in `backend/tests/unit/worker/sendWorker.test.ts`
- [ ] T074 [P] [US3] Add contract tests for send queue and send-attempt endpoints in `backend/tests/contract/send.contract.test.ts`
- [ ] T075 [P] [US3] Add frontend unit tests for send status and recovery guidance in `frontend/tests/unit/campaigns/SendStatusPanel.test.tsx`
- [ ] T076 [US3] Add manual validation checklist for EmailLabs success and failure scenarios in `specs/001-mailing-campaigns/quickstart.md`

### Implementation for User Story 3

- [ ] T077 [P] [US3] Implement EmailLabs client with JSON API keys, timeouts, bounded retries, and redacted logging in `backend/src/email-labs/emailLabsClient.ts`
- [ ] T078 [P] [US3] Implement provider request mapping with recipient variables and untouched placeholders in `backend/src/email-labs/emailLabsMapper.ts`
- [ ] T079 [US3] Implement send job repository with Drizzle ORM only in `backend/src/worker/sendJobRepository.ts`
- [ ] T080 [US3] Implement send attempt repository with Drizzle ORM only in `backend/src/worker/sendAttemptRepository.ts`
- [ ] T081 [US3] Implement send queue service that enqueues work asynchronously in `backend/src/worker/sendQueueService.ts`
- [ ] T082 [US3] Implement worker processor for pending jobs, outcomes, retries, and duplicate-send safety in `backend/src/worker/sendWorkerService.ts`
- [ ] T083 [US3] Implement send API routes for queueing and send-attempt retrieval in `backend/src/campaigns/sendRoutes.ts`
- [ ] T084 [US3] Register send routes and OpenAPI validators in `backend/src/api/routes.ts`
- [ ] T085 [P] [US3] Implement frontend send API methods in `frontend/src/campaigns/sendApi.ts`
- [ ] T086 [US3] Implement send trigger and status panel in `frontend/src/campaigns/SendStatusPanel.tsx`

**Checkpoint**: User Stories 1, 2, and 3 are independently functional; sending
is asynchronous and externally failure-safe.

---

## Phase 6: User Story 4 - Use API and MCP Interfaces (Priority: P4)

**Goal**: API clients and AI agents can perform the same core contact, campaign,
validation, and send workflows with identical validation and authorization rules.

**Independent Test**: Use API and MCP tools to run contact CRUD, campaign
preparation, variable validation, send queueing, and assigned-operator access
checks, including invalid and duplicate inputs.

### Tests and Validation for User Story 4

- [ ] T087 [P] [US4] Add unit tests for MCP tool input mapping and error handling in `backend/tests/unit/mcp/mcpTools.test.ts`
- [ ] T088 [P] [US4] Add contract tests for API operator assignment restrictions in `backend/tests/contract/operatorAccess.contract.test.ts`
- [ ] T089 [P] [US4] Add unit tests for MCP operator assignment restrictions in `backend/tests/unit/mcp/mcpAuthorization.test.ts`
- [ ] T090 [US4] Add manual validation checklist for API and MCP parity in `specs/001-mailing-campaigns/quickstart.md`

### Implementation for User Story 4

- [ ] T091 [P] [US4] Implement MCP contact tools in `backend/src/mcp/contactTools.ts`
- [ ] T092 [P] [US4] Implement MCP campaign tools in `backend/src/mcp/campaignTools.ts`
- [ ] T093 [US4] Implement MCP send status and queue tools in `backend/src/mcp/sendTools.ts`
- [ ] T094 [US4] Wire MCP tools into MCP server registration in `backend/src/mcp/server.ts`
- [ ] T095 [US4] Ensure MCP tools reuse service-layer validation and authorization in `backend/src/mcp/toolContext.ts`
- [ ] T096 [US4] Implement API authorization tests for admin and operator role boundaries in `backend/tests/contract/operatorAccess.contract.test.ts`
- [ ] T097 [US4] Implement frontend operator access error handling in `frontend/src/common/AuthorizationBoundary.tsx`

**Checkpoint**: API and MCP automation parity is complete with assigned-operator
restrictions.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, documentation, and release validation across all stories.

- [ ] T098 [P] Update root documentation for local setup and service roles in `README.md`
- [ ] T099 [P] Add seed script for one admin and two operators in `backend/src/db/seed.ts`
- [ ] T100 Confirm OpenAPI-derived validation is used by every endpoint in `backend/src/api/routes.ts`
- [ ] T101 Confirm no direct SQL invocations exist outside Drizzle migration/tooling files in `backend/src/db/schema.ts`
- [ ] T102 Confirm logs redact EmailLabs keys, bearer tokens, and provider secrets in `backend/src/common/logger.ts`
- [ ] T103 Confirm rate-limited callers receive retry guidance in `backend/src/rate-limit/rateLimitMiddleware.ts`
- [ ] T104 Confirm Docker Compose starts backend, frontend, worker, MCP server, and database in `docker-compose.yml`
- [ ] T105 Run all workspace unit and contract tests with `package.json`
- [ ] T106 Run quickstart validation and record results in `specs/001-mailing-campaigns/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 and blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Phase 2.
- **Polish (Phase 7)**: Depends on the implemented stories selected for release.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2; no dependency on other stories.
- **User Story 2 (P2)**: Starts after Phase 2; uses contacts when available but
  remains independently testable with seeded contacts.
- **User Story 3 (P3)**: Starts after Phase 2; requires prepared campaign data
  and can be tested with seeded campaign/recipient rows.
- **User Story 4 (P4)**: Starts after Phase 2; reuses service-layer behavior
  from implemented stories and verifies API/MCP parity.

### Within Each User Story

- Tests and validation tasks precede implementation tasks.
- ORM schema and shared types precede repositories.
- Repositories precede services.
- Services precede routes, MCP tools, and frontend wiring.
- OpenAPI contract validation precedes endpoint implementation.
- UI API clients precede views that consume them.

## Parallel Opportunities

- Setup tasks marked `[P]` can run in parallel after T001 and T002.
- Foundational auth, rate-limit tests, and API validation tests marked `[P]` can
  run in parallel once package setup exists.
- Within each story, unit tests and contract tests marked `[P]` can be written in
  parallel.
- Frontend API/view tasks marked `[P]` can run after corresponding DTOs and API
  contracts exist.
- After Phase 2, stories can be staffed in parallel, but the recommended
  delivery order remains P1 -> P2 -> P3 -> P4.

## Parallel Example: User Story 1

```text
Task: "T038 [P] [US1] Add unit tests for contact normalization and validation in backend/tests/unit/contacts/contactValidation.test.ts"
Task: "T039 [P] [US1] Add unit tests for duplicate email handling in backend/tests/unit/contacts/contactService.test.ts"
Task: "T040 [P] [US1] Add contract tests for contact CRUD OpenAPI validation in backend/tests/contract/contacts.contract.test.ts"
Task: "T041 [P] [US1] Add frontend unit tests for contact form validation feedback in frontend/tests/unit/contacts/ContactForm.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "T053 [P] [US2] Add unit tests for placeholder extraction and unsupported placeholder detection in backend/tests/unit/campaigns/placeholderValidation.test.ts"
Task: "T054 [P] [US2] Add unit tests for recipient variable and fallback validation in backend/tests/unit/campaigns/variableValidation.test.ts"
Task: "T055 [P] [US2] Add contract tests for campaign CRUD, recipients, and variable validation endpoints in backend/tests/contract/campaigns.contract.test.ts"
Task: "T056 [P] [US2] Add frontend unit tests for campaign form, recipient selection, and variable warnings in frontend/tests/unit/campaigns/CampaignEditor.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "T071 [P] [US3] Add unit tests for send eligibility and duplicate-send prevention in backend/tests/unit/worker/sendEligibility.test.ts"
Task: "T072 [P] [US3] Add unit tests for EmailLabs request mapping and secret-safe error summaries in backend/tests/unit/email-labs/emailLabsClient.test.ts"
Task: "T073 [P] [US3] Add unit tests for send job claiming, retry limits, and uncertain outcomes in backend/tests/unit/worker/sendWorker.test.ts"
Task: "T074 [P] [US3] Add contract tests for send queue and send-attempt endpoints in backend/tests/contract/send.contract.test.ts"
```

## Parallel Example: User Story 4

```text
Task: "T087 [P] [US4] Add unit tests for MCP tool input mapping and error handling in backend/tests/unit/mcp/mcpTools.test.ts"
Task: "T088 [P] [US4] Add contract tests for API operator assignment restrictions in backend/tests/contract/operatorAccess.contract.test.ts"
Task: "T089 [P] [US4] Add unit tests for MCP operator assignment restrictions in backend/tests/unit/mcp/mcpAuthorization.test.ts"
Task: "T091 [P] [US4] Implement MCP contact tools in backend/src/mcp/contactTools.ts"
Task: "T092 [P] [US4] Implement MCP campaign tools in backend/src/mcp/campaignTools.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundation.
3. Complete Phase 3 contact management.
4. Stop and validate contact CRUD independently through unit tests, contract
   tests, UI behavior, and quickstart steps.

### Incremental Delivery

1. Add User Story 1 for contact management.
2. Add User Story 2 for campaign preparation and personalization validation.
3. Add User Story 3 for asynchronous EmailLabs sending and failure handling.
4. Add User Story 4 for API/MCP parity and operator access coverage.

### Team Parallelization

After Phase 2, separate contributors can work on backend services, frontend
screens, and MCP/API parity tasks as long as they keep OpenAPI-derived contracts
and shared types synchronized.
