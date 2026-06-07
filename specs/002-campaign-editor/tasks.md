# Tasks: Campaign Editor

**Input**: Design documents from `/specs/002-campaign-editor/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [quickstart.md](./quickstart.md), [contracts/openapi-delta.yaml](./contracts/openapi-delta.yaml), [contracts/mcp-tools-delta.md](./contracts/mcp-tools-delta.md)

**Tests**: Unit tests are required for every major function. Contract tests are
required for OpenAPI-derived endpoint validation. Browser-specific editor
behavior and provider failure review flows also require quickstart/manual
validation; no integration test suite is planned.

**Organization**: Tasks are grouped by user story so the editor can be delivered
as independently testable increments on top of the feature-001 mailing campaigns
application.

## Phase 1: Setup (Feature Delta)

**Purpose**: Add the spec-002 dependencies, shared types, and contract sources
needed by all campaign editor stories.

- [X] T001 Add `pell`, DOMPurify, and backend Node DOM adapter dependencies in `frontend/package.json`
- [X] T002 Add backend DOMPurify and Node DOM adapter dependencies in `backend/package.json`
- [X] T003 Add campaign editor shared DTO and status types in `common/types/campaign-editor.ts`
- [X] T004 Copy the spec-002 OpenAPI delta into backend validation sources in `backend/src/api/openapi-validation/campaign-editor.openapi.yaml`
- [X] T005 [P] Add frontend campaign editor directory barrel exports in `frontend/src/campaign-editor/index.ts`
- [X] T006 [P] Add backend campaign editor directory barrel exports in `backend/src/campaign-editor/index.ts`
- [X] T007 Add campaign editor feature route entry to frontend navigation in `frontend/src/layout/AppLayout.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared editor services, validation plumbing, authorization
reuse, and OpenAPI delta registration before user-story work.

**CRITICAL**: No user story work should begin until this phase is complete.

- [X] T008 Implement OpenAPI delta merge or registration for campaign editor schemas in `backend/src/api/openapi-validation/campaignEditorValidation.ts`
- [X] T009 [P] Add contract tests for campaign editor OpenAPI delta schema loading in `backend/tests/contract/campaignEditorOpenApi.contract.test.ts`
- [X] T010 Implement campaign editor authorization helper that reuses assigned-campaign checks in `backend/src/campaign-editor/editorAuthorization.ts`
- [X] T011 [P] Add unit tests for campaign editor authorization in `backend/tests/unit/campaign-editor/editorAuthorization.test.ts`
- [X] T012 Implement campaign editor repository methods with Drizzle ORM only in `backend/src/campaign-editor/editorRepository.ts`
- [X] T013 Implement shared placeholder extraction for valid `{{ value }}` tokens in `backend/src/campaign-editor/placeholder.service.ts`
- [X] T014 [P] Add unit tests for placeholder extraction and invalid placeholder detection in `backend/tests/unit/campaign-editor/placeholder.service.test.ts`
- [X] T015 Implement strict HTML allowlist constants for editor content in `backend/src/campaign-editor/editorAllowlist.ts`
- [X] T016 Implement frontend campaign editor API client methods in `frontend/src/campaign-editor/campaignEditorApi.ts`
- [X] T017 Implement campaign editor route registration in `backend/src/campaign-editor/editor.controller.ts`
- [X] T018 Register campaign editor HTTP routes in `backend/src/api/routes.ts`

**Checkpoint**: Editor foundation is ready. User story implementation can now
proceed.

---

## Phase 3: User Story 1 - Compose Campaign Content (Priority: P1) MVP

**Goal**: Operators can open the campaign editor, enter a topic and rich-text
body, use toolbar controls, preserve `{{ value }}` placeholders, save, reopen,
and preview allowed generated HTML.

**Independent Test**: Create a campaign draft, add topic and body content, apply
bold, italic, heading, and font controls, add placeholders, save, reopen, and
confirm formatting and placeholders are preserved.

### Tests and Validation for User Story 1

- [X] T019 [P] [US1] Add unit tests for editor draft save service behavior in `backend/tests/unit/campaign-editor/editor.service.test.ts`
- [X] T020 [P] [US1] Add contract tests for get and save editor draft endpoints in `backend/tests/contract/campaignEditorDraft.contract.test.ts`
- [X] T021 [P] [US1] Add frontend unit tests for toolbar command wiring in `frontend/tests/unit/campaign-editor/CampaignEditorToolbar.test.tsx`
- [X] T022 [P] [US1] Add frontend unit tests for editor page save and reopen state in `frontend/tests/unit/campaign-editor/CampaignEditorPage.test.tsx`
- [X] T023 [US1] Add manual validation checklist for composing content in `specs/002-campaign-editor/quickstart.md`

### Implementation for User Story 1

- [X] T024 [P] [US1] Implement frontend campaign editor local types in `frontend/src/campaign-editor/campaignEditor.types.ts`
- [X] T025 [P] [US1] Implement backend editor service for get and save draft in `backend/src/campaign-editor/editor.service.ts`
- [X] T026 [US1] Implement `GET /campaigns/{campaignId}/editor` and `PUT /campaigns/{campaignId}/editor` handlers in `backend/src/campaign-editor/editor.controller.ts`
- [X] T027 [US1] Implement frontend `pell` editor wrapper in `frontend/src/campaign-editor/PellEditor.tsx`
- [X] T028 [US1] Implement campaign editor toolbar for bold, italic, headings 1-6, and font selection in `frontend/src/campaign-editor/CampaignEditorToolbar.tsx`
- [X] T029 [US1] Implement campaign editor page with topic input, editor body, save, and reload behavior in `frontend/src/campaign-editor/CampaignEditorPage.tsx`
- [X] T030 [US1] Implement campaign preview component that displays allowed generated HTML and placeholders in `frontend/src/campaign-editor/CampaignPreview.tsx`
- [X] T031 [US1] Wire campaign editor route into campaign list/detail navigation in `frontend/src/campaigns/CampaignsPage.tsx`

**Checkpoint**: User Story 1 is independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Reject Unsafe HTML Authoring (Priority: P2)

**Goal**: Typed or pasted HTML is treated as plain sanitized text, while only
toolbar-generated formatting is preserved as allowed HTML.

**Independent Test**: Type and paste HTML/script-like content, save and preview
the campaign, and confirm raw HTML is never interpreted as markup while allowed
toolbar formatting still renders.

### Tests and Validation for User Story 2

- [X] T032 [P] [US2] Add backend unit tests for DOMPurify allowlist sanitization in `backend/tests/unit/campaign-editor/sanitize.service.test.ts`
- [X] T033 [P] [US2] Add frontend unit tests for preview sanitization helper in `frontend/tests/unit/campaign-editor/sanitizePreview.test.ts`
- [X] T034 [P] [US2] Add contract tests for preview endpoint validation and sanitized response behavior in `backend/tests/contract/campaignEditorPreview.contract.test.ts`
- [X] T035 [P] [US2] Add frontend unit tests for paste and direct HTML handling in `frontend/tests/unit/campaign-editor/PellEditor.test.tsx`
- [X] T036 [US2] Add manual validation checklist for unsafe HTML authoring in `specs/002-campaign-editor/quickstart.md`

### Implementation for User Story 2

- [X] T037 [P] [US2] Implement backend DOMPurify sanitizer with strict allowlist in `backend/src/campaign-editor/sanitize.service.ts`
- [X] T038 [P] [US2] Implement frontend preview sanitizer with matching allowlist in `frontend/src/campaign-editor/sanitizePreview.ts`
- [X] T039 [US2] Update editor save flow to sanitize content server-side before persistence in `backend/src/campaign-editor/editor.service.ts`
- [X] T040 [US2] Implement `POST /campaigns/{campaignId}/editor/preview` handler in `backend/src/campaign-editor/editor.controller.ts`
- [X] T041 [US2] Update `PellEditor` paste handling so raw HTML is inserted as text in `frontend/src/campaign-editor/PellEditor.tsx`
- [X] T042 [US2] Display sanitization warnings for direct HTML authoring in `frontend/src/campaign-editor/CampaignEditorPage.tsx`
- [X] T043 [US2] Ensure preview renders only sanitized HTML in `frontend/src/campaign-editor/CampaignPreview.tsx`

**Checkpoint**: User Stories 1 and 2 both work independently; authoring is safe
against direct HTML input.

---

## Phase 5: User Story 3 - Prevent Duplicate Sends During Failures (Priority: P3)

**Goal**: Operators can validate placeholders, inspect recipient send outcomes,
retry only safe recipients automatically, and explicitly force resend uncertain
recipients after acknowledging duplicate risk.

**Independent Test**: Simulate submitted, failed, pending, and uncertain
recipients; confirm automatic recovery excludes submitted and uncertain rows;
confirm force resend works only for uncertain recipients with acknowledgement.

### Tests and Validation for User Story 3

- [X] T044 [P] [US3] Add unit tests for recipient variable validation in `backend/tests/unit/campaign-editor/variableValidation.service.test.ts`
- [X] T045 [P] [US3] Add unit tests for send recovery eligibility and duplicate prevention in `backend/tests/unit/campaign-editor/send-recovery.service.test.ts`
- [X] T046 [P] [US3] Add contract tests for editor validate, send outcomes, and force resend endpoints in `backend/tests/contract/campaignEditorRecovery.contract.test.ts`
- [X] T047 [P] [US3] Add frontend unit tests for send outcome panel states in `frontend/tests/unit/campaign-editor/SendOutcomePanel.test.tsx`
- [X] T048 [P] [US3] Add MCP unit tests for editor recovery tools in `backend/tests/unit/mcp/campaignEditorTools.test.ts`
- [X] T049 [US3] Add manual validation checklist for duplicate-send recovery behavior in `specs/002-campaign-editor/quickstart.md`

### Implementation for User Story 3

- [X] T050 [P] [US3] Implement recipient variable validation service using contact fields, personalization data, and fallback variables in `backend/src/campaign-editor/variableValidation.service.ts`
- [X] T051 [P] [US3] Implement send recovery service for outcome classification, safe retry eligibility, and force resend validation in `backend/src/campaign-editor/send-recovery.service.ts`
- [X] T052 [US3] Implement `POST /campaigns/{campaignId}/editor/validate` handler in `backend/src/campaign-editor/editor.controller.ts`
- [X] T053 [US3] Implement `GET /campaigns/{campaignId}/send-outcomes` handler in `backend/src/campaign-editor/editor.controller.ts`
- [X] T054 [US3] Implement `POST /campaigns/{campaignId}/recipients/{contactId}/force-resend` handler in `backend/src/campaign-editor/editor.controller.ts`
- [X] T055 [US3] Persist force resend acknowledgements and queued job references using Drizzle ORM in `backend/src/campaign-editor/editorRepository.ts`
- [X] T056 [US3] Enqueue force resend work asynchronously without calling EmailLabs inline in `backend/src/campaign-editor/send-recovery.service.ts`
- [X] T057 [P] [US3] Implement send outcome API client methods in `frontend/src/campaign-editor/campaignEditorApi.ts`
- [X] T058 [US3] Implement send outcome panel with pending, submitted, failed, uncertain, and review-required states in `frontend/src/campaign-editor/SendOutcomePanel.tsx`
- [X] T059 [US3] Implement force resend acknowledgement UI in `frontend/src/campaign-editor/ForceResendDialog.tsx`
- [X] T060 [US3] Implement MCP campaign editor tools in `backend/src/mcp/campaignEditorTools.ts`
- [X] T061 [US3] Register MCP campaign editor tools in `backend/src/mcp/server.ts`

**Checkpoint**: All user stories are independently functional; automatic
recovery is duplicate-safe and force resend is explicit.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Hardening, documentation, and validation across the editor feature.

- [X] T062 [P] Update campaign editor implementation notes in `README.md`
- [X] T063 Confirm every campaign editor endpoint uses OpenAPI-derived validation in `backend/src/api/routes.ts`
- [X] T064 Confirm campaign editor endpoints add no feature-specific rate limiting in `backend/src/campaign-editor/editor.controller.ts`
- [X] T065 Confirm assigned-operator restrictions apply to editor, preview, validate, outcome, and force-resend actions in `backend/src/campaign-editor/editorAuthorization.ts`
- [X] T066 Confirm no direct SQL invocations exist in campaign editor code outside Drizzle migration/tooling files in `backend/src/campaign-editor/editorRepository.ts`
- [X] T067 Confirm no EmailLabs request is made during editor save, preview, validation, send outcome, or force resend HTTP handling in `backend/src/campaign-editor/send-recovery.service.ts`
- [X] T068 Run all campaign editor unit and contract tests with `package.json`
- [X] T069 Run quickstart validation and record results in `specs/002-campaign-editor/quickstart.md`

---

## Phase 7: Main Page Assigned Editor Selection

**Purpose**: Update the main campaign page so users select an editor/operator and
only campaigns assigned to that editor are selectable for editing.

- [X] T070 [P] [US1] Add backend contract coverage for `GET /campaigns?assignedEditorId=...` filtering in `backend/tests/contract/campaignEditorAssignment.contract.test.ts`
- [X] T071 [P] [US1] Add backend unit tests for assigned editor campaign filtering in `backend/tests/unit/campaigns/campaignAssignmentFilter.test.ts`
- [X] T072 [P] [US1] Add frontend unit tests for assigned editor selector behavior in `frontend/tests/unit/campaigns/AssignedCampaignSelector.test.tsx`
- [X] T073 [US1] Extend campaign listing API contract to accept `assignedEditorId` query filtering in `backend/src/api/openapi.yaml`
- [X] T074 [US1] Implement assigned editor filtering in the campaign repository/service list flow in `backend/src/campaigns/campaignRepository.ts` and `backend/src/campaigns/campaignService.ts`
- [X] T075 [US1] Add frontend assigned editor selector and empty state in `frontend/src/campaigns/AssignedCampaignSelector.tsx`
- [X] T076 [US1] Wire selected editor state into `frontend/src/campaigns/CampaignsPage.tsx` so only assigned campaigns can open the editor
- [X] T077 [US1] Update quickstart validation results after assigned editor selection manual checks in `specs/002-campaign-editor/quickstart.md`

---

## Phase 8: Auth-Triggered Protected Data Reload

**Purpose**: Ensure contacts and campaigns are loaded after successful login even
when their first page-load requests failed with 401 before authentication.

- [X] T078 [P] [US1] Add frontend unit test for reloading contacts after login in `frontend/tests/unit/contacts/ContactsPageAuthReload.test.tsx`
- [X] T079 [P] [US1] Add frontend unit test for reloading campaigns after login in `frontend/tests/unit/campaigns/CampaignsPageAuthReload.test.tsx`
- [X] T080 [US1] Propagate authentication state changes from `frontend/src/layout/AppLayout.tsx` to protected contacts and campaigns sections
- [X] T081 [US1] Update `frontend/src/contacts/ContactsPage.tsx` so successful login triggers reload after prior unauthenticated failure
- [X] T082 [US1] Update `frontend/src/campaigns/CampaignsPage.tsx` so successful login triggers reload after prior unauthenticated failure and assigned-editor options refresh
- [X] T083 [US1] Ensure protected contacts and campaigns clear stale data or show an unauthenticated state after token loss/logout in `frontend/src/auth/authStore.ts` and page components
- [X] T084 [US1] Update quickstart validation results for login-triggered contacts/campaigns reload in `specs/002-campaign-editor/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Depends on feature-001 application foundation.
- **Foundational (Phase 2)**: Depends on Phase 1 and blocks all spec-002 user stories.
- **User Stories (Phase 3+)**: Depend on Phase 2.
- **Polish (Phase 6)**: Depends on the implemented stories selected for release.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2; no dependency on other spec-002 stories.
- **User Story 2 (P2)**: Starts after Phase 2; can use seeded editor content but should be delivered after US1 for the complete editor workflow.
- **User Story 3 (P3)**: Starts after Phase 2; depends on feature-001 send state data and can be tested with seeded recipient outcomes.

### Within Each User Story

- Tests and validation tasks precede implementation tasks.
- Shared types and OpenAPI delta registration precede routes and clients.
- Repository methods precede services.
- Services precede HTTP handlers and MCP tools.
- Frontend API methods precede UI components that consume them.
- Manual quickstart validation follows automated unit and contract coverage.

## Parallel Opportunities

- Setup tasks marked `[P]` can run in parallel after dependency updates.
- Foundational tests, authorization helpers, placeholder services, and allowlist constants marked `[P]` can run in parallel.
- Within each story, unit and contract tests marked `[P]` can be written in parallel.
- Frontend UI tasks can run in parallel with backend service tasks after shared DTOs and OpenAPI delta paths are stable.
- After Phase 2, stories can be staffed in parallel, but the recommended delivery order remains P1 -> P2 -> P3.

## Parallel Example: User Story 1

```text
Task: "T019 [P] [US1] Add unit tests for editor draft save service behavior in backend/tests/unit/campaign-editor/editor.service.test.ts"
Task: "T020 [P] [US1] Add contract tests for get and save editor draft endpoints in backend/tests/contract/campaignEditorDraft.contract.test.ts"
Task: "T021 [P] [US1] Add frontend unit tests for toolbar command wiring in frontend/tests/unit/campaign-editor/CampaignEditorToolbar.test.tsx"
Task: "T022 [P] [US1] Add frontend unit tests for editor page save and reopen state in frontend/tests/unit/campaign-editor/CampaignEditorPage.test.tsx"
```

## Parallel Example: User Story 2

```text
Task: "T032 [P] [US2] Add backend unit tests for DOMPurify allowlist sanitization in backend/tests/unit/campaign-editor/sanitize.service.test.ts"
Task: "T033 [P] [US2] Add frontend unit tests for preview sanitization helper in frontend/tests/unit/campaign-editor/sanitizePreview.test.ts"
Task: "T034 [P] [US2] Add contract tests for preview endpoint validation and sanitized response behavior in backend/tests/contract/campaignEditorPreview.contract.test.ts"
Task: "T035 [P] [US2] Add frontend unit tests for paste and direct HTML handling in frontend/tests/unit/campaign-editor/PellEditor.test.tsx"
```

## Parallel Example: User Story 3

```text
Task: "T044 [P] [US3] Add unit tests for recipient variable validation in backend/tests/unit/campaign-editor/variableValidation.service.test.ts"
Task: "T045 [P] [US3] Add unit tests for send recovery eligibility and duplicate prevention in backend/tests/unit/campaign-editor/send-recovery.service.test.ts"
Task: "T046 [P] [US3] Add contract tests for editor validate, send outcomes, and force resend endpoints in backend/tests/contract/campaignEditorRecovery.contract.test.ts"
Task: "T047 [P] [US3] Add frontend unit tests for send outcome panel states in frontend/tests/unit/campaign-editor/SendOutcomePanel.test.tsx"
Task: "T048 [P] [US3] Add MCP unit tests for editor recovery tools in backend/tests/unit/mcp/campaignEditorTools.test.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 foundation.
3. Complete Phase 3 editor compose flow.
4. Stop and validate draft save/reopen, toolbar formatting, placeholder
   preservation, OpenAPI validation, and quickstart compose steps.

### Incremental Delivery

1. Add User Story 1 for composing and saving campaign content.
2. Add User Story 2 for rejecting direct HTML authoring and preserving only
   allowlisted formatting.
3. Add User Story 3 for duplicate-safe recovery, send outcome review, force
   resend acknowledgement, and MCP parity.

### Team Parallelization

After Phase 2, separate contributors can work on backend editor services,
frontend editor components, recovery services, and MCP tools as long as they keep
OpenAPI-derived contracts and shared types synchronized.
