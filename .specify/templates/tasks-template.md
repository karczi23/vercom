---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Clarifications**: Tasks MUST NOT imply unresolved decisions. If a task depends
on unanswered behavior, data, API, security, architecture, testing, container, or
release-workflow choices, add a blocking clarification task instead of choosing a
default.

**Tests**: Include unit test tasks for every major function and automated test
tasks for behavior crossing module, API, persistence, security, or user-facing
boundaries. If automation is not practical, include a manual validation task with
the documented rationale from plan.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`, separate backend/db containers
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize TypeScript project with strict mode enabled
- [ ] T003 [P] Configure linting and formatting tools
- [ ] T004 [P] Configure unit, contract, and integration test commands documented in plan.md
- [ ] T005 [P] Create separate container definitions for backend, db, and supporting services
- [ ] T006 Resolve all blocking clarification questions documented in spec.md or plan.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T007 Setup ORM schema and migrations framework without direct SQL invocations
- [ ] T008 [P] Implement authentication/authorization framework
- [ ] T009 [P] Setup API routing and middleware structure
- [ ] T010 Generate or wire endpoint validation from the OpenAPI specification
- [ ] T011 Configure 10 requests/minute rate limiting per caller
- [ ] T012 Create base models/entities that all stories depend on
- [ ] T013 Configure external API timeout, retry, fallback, and logging utilities
- [ ] T014 Setup environment configuration management
- [ ] T015 [P] Add data validation, retention, or privacy controls required by plan.md
- [ ] T016 [P] Add asynchronous communication infrastructure required by plan.md

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests and Validation for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T017 [P] [US1] Unit tests for major functions in tests/unit/[name].test.ts
- [ ] T018 [P] [US1] Contract test for OpenAPI validation in tests/contract/[name].test.ts
- [ ] T019 [P] [US1] Integration test for [user journey] in tests/integration/[name].test.ts
- [ ] T020 [P] [US1] Rate-limit test for 10 requests/minute behavior
- [ ] T021 [US1] Manual validation for [scenario] documented in quickstart.md

### Implementation for User Story 1

- [ ] T022 [P] [US1] Create [Entity1] ORM model in src/models/[entity1].ts
- [ ] T023 [P] [US1] Create [Entity2] ORM model in src/models/[entity2].ts
- [ ] T024 [US1] Implement [Service] in src/services/[service].ts (depends on T022, T023)
- [ ] T025 [US1] Implement [endpoint/feature] in src/[location]/[file].ts
- [ ] T026 [US1] Add OpenAPI-derived validation and safe error handling
- [ ] T027 [US1] Add asynchronous communication for user story 1 operations
- [ ] T028 [US1] Add logging for user story 1 operations

**Checkpoint**: At this point, User Story 1 MUST be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests and Validation for User Story 2

- [ ] T029 [P] [US2] Unit tests for major functions in tests/unit/[name].test.ts
- [ ] T030 [P] [US2] Contract test for OpenAPI validation in tests/contract/[name].test.ts
- [ ] T031 [P] [US2] Integration test for [user journey] in tests/integration/[name].test.ts
- [ ] T032 [US2] Manual validation for [scenario] documented in quickstart.md

### Implementation for User Story 2

- [ ] T033 [P] [US2] Create [Entity] ORM model in src/models/[entity].ts
- [ ] T034 [US2] Implement [Service] in src/services/[service].ts
- [ ] T035 [US2] Implement [endpoint/feature] in src/[location]/[file].ts
- [ ] T036 [US2] Integrate with User Story 1 components asynchronously (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 MUST both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests and Validation for User Story 3

- [ ] T037 [P] [US3] Unit tests for major functions in tests/unit/[name].test.ts
- [ ] T038 [P] [US3] Contract test for OpenAPI validation in tests/contract/[name].test.ts
- [ ] T039 [P] [US3] Integration test for [user journey] in tests/integration/[name].test.ts
- [ ] T040 [US3] Manual validation for [scenario] documented in quickstart.md

### Implementation for User Story 3

- [ ] T041 [P] [US3] Create [Entity] ORM model in src/models/[entity].ts
- [ ] T042 [US3] Implement [Service] in src/services/[service].ts
- [ ] T043 [US3] Implement [endpoint/feature] in src/[location]/[file].ts

**Checkpoint**: All user stories MUST now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Confirm all endpoint validators are generated or derived from OpenAPI
- [ ] TXXX Confirm no direct SQL invocations exist outside ORM migrations/tooling
- [ ] TXXX Confirm all external API failures are handled gracefully
- [ ] TXXX Validate container startup for backend, db, and supporting services
- [ ] TXXX Review logs, configuration, and operational notes
- [ ] TXXX Confirm no secrets or sensitive data are committed or logged
- [ ] TXXX Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but MUST remain independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but MUST remain independently testable

### Within Each User Story

- Tests or validation tasks MUST be written before implementation
- Automated tests SHOULD fail before implementation when applicable
- Blocking clarification questions before tasks that depend on their answers
- Major functions before their dependent endpoints
- Models before services
- Services before endpoints
- OpenAPI contract before endpoint validators
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit tests for major functions in tests/unit/[name].test.ts"
Task: "Contract test for OpenAPI validation in tests/contract/[name].test.ts"
Task: "Integration test for [user journey] in tests/integration/[name].test.ts"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] ORM model in src/models/[entity1].ts"
Task: "Create [Entity2] ORM model in src/models/[entity2].ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story MUST be independently completable and testable
- Verify tests fail before implementing
- Commit surgical, precise changes after each task or logical group
- Never push directly to main; use feature branches and owner-accepted PRs
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
