<!--
Sync Impact Report
Version change: 1.1.0 -> 1.2.0
Modified principles:
- I. Spec-Led User Value -> I. Spec-Led User Value
- II. Minimal, Explicit Architecture -> II. Minimal, Explicit Architecture
- III. Verifiable Increments -> III. Verifiable Increments
- IV. Data Protection and Security by Default -> IV. Contract-Driven Security and Data Access
- V. Operable, Maintainable Systems -> V. Operable, Containerized Systems
Added sections:
- Pull Request and Commit Discipline
Removed sections:
- None
Templates requiring updates:
- .specify/templates/plan-template.md - updated
- .specify/templates/spec-template.md - updated
- .specify/templates/tasks-template.md - updated
- .specify/templates/checklist-template.md - updated
- .specify/templates/commands/*.md - not present
Runtime guidance reviewed:
- AGENTS.md - no change required
- .specify/extensions/* command docs - no change required
Follow-up TODOs:
- None
-->
# Vercom Constitution

## Core Principles

### I. Spec-Led User Value
Every feature MUST start from a written specification that identifies the target
users, prioritized user journeys, acceptance scenarios, measurable outcomes, and
explicit out-of-scope assumptions. Implementation work MUST preserve independent
delivery of the highest-priority journey first, so each increment can be reviewed
and validated on its own. All communication between services, workers, clients,
and external systems MUST be asynchronous unless the plan documents a required
synchronous protocol boundary and its failure handling. Unresolved decisions MUST
not be implied or filled with assumed behavior; they MUST be captured as specific
clarification questions for the project owner before planning or implementation
depends on them.

### II. Minimal, Explicit Architecture
Plans MUST describe the selected TypeScript project structure, real source paths,
runtime boundaries, dependencies, containers, and rejected alternatives before
implementation begins. TypeScript MUST run in strict mode for application and test
code. Backend, database, worker, and other runtime services MUST be isolated in
separate containers when they are part of the delivered system. New frameworks,
services, packages, data stores, or abstractions MUST be justified by a concrete
requirement or documented constraint.

### III. Verifiable Increments
Each user story MUST include an independent verification path before it is marked
complete. Major functions MUST have unit tests that cover success, failure, and
edge behavior. Behavior that crosses module, API, persistence, security, or
user-facing boundaries MUST have automated tests unless the plan documents why
automation is not practical and gives an equivalent manual validation procedure.
Tests or validation steps MUST be added before or alongside implementation tasks,
and known test gaps MUST be recorded before release.

### IV. Contract-Driven Security and Data Access
Every endpoint MUST validate requests and responses using validation rules derived
from the OpenAPI specification. API traffic MUST be rate limited to 10 requests
per minute unless a stricter limit is required by the feature. Features that read,
write, transmit, or expose data MUST define ownership, retention, authorization,
validation, and error-handling expectations in the spec or plan. Direct SQL
invocations are prohibited in application code; persistence MUST use the approved
ORM and its migration tooling. Secrets MUST never be committed, logged, or
embedded in generated artifacts.

### V. Operable, Containerized Systems
Delivered work MUST include the operational hooks needed to diagnose, support, and
evolve it: clear configuration, meaningful error handling, useful logs or metrics
where behavior can fail in production, and documentation for new workflows or
manual steps. All external API requests MUST fail gracefully with timeouts,
bounded retries where appropriate, safe fallback behavior, and actionable logs
that do not leak secrets or sensitive data. Changes MUST follow the existing
repository patterns unless the plan documents why a different pattern is
necessary.

## Technical Standards

Technology choices MUST be recorded in the implementation plan with TypeScript
version, strict-mode configuration, primary dependencies, ORM, storage, test
command, target platform, performance constraints, container topology, and
deployment or runtime assumptions. Generated or hand-written code MUST use
existing repository conventions once application code exists. Until a stack is
established, plans MUST choose conservative defaults and keep dependencies
minimal.

All feature artifacts MUST use concrete paths, commands, and validation steps.
Placeholders such as NEEDS CLARIFICATION are allowed only when the missing answer
blocks an implementation decision; the plan or spec MUST list the exact question,
the affected decision, and the impact of leaving it unanswered. Assumptions are
allowed only for non-blocking defaults that do not change user-visible behavior,
security posture, data handling, architecture, or release scope. OpenAPI
contracts, validation schemas, ORM models, migrations, and container definitions
MUST stay traceable to the feature plan.

## Development Workflow

Work proceeds in this order: specification, clarification when needed, plan,
tasks, implementation, verification, and review. The Constitution Check in each
plan is a gate before Phase 0 research and MUST be re-evaluated after Phase 1
design. Any violation MUST be documented in Complexity Tracking with the reason,
the simpler alternative considered, and the mitigation.

Clarification is mandatory when feature behavior, data handling, API contract,
security, rate limiting, asynchronous communication, persistence, container
topology, testing expectations, or release workflow is ambiguous. Work MUST pause
at the relevant artifact until the project owner answers the specific questions
or explicitly defers the decision with documented scope impact.

Tasks MUST be grouped by independently testable user story, with foundational
work limited to prerequisites that block multiple stories. Each story MUST end at
a checkpoint where its behavior can be demonstrated or validated without relying
on unfinished lower-priority stories.

## Pull Request and Commit Discipline

Changes MUST be surgical and precise: each commit MUST contain one coherent
change, avoid unrelated formatting or refactors, and include the smallest useful
set of files. Direct pushes to main are prohibited. Work MUST happen on feature
branches and enter main only through pull requests accepted by the project owner.
Any generated artifact changes MUST be committed with the source or governance
change that made them necessary.

## Governance

This constitution supersedes conflicting project practices, templates, and
generated plans. Amendments require a documented change to this file, a Sync
Impact Report, and updates to affected templates or runtime guidance in the same
change whenever practical.

Versioning follows semantic versioning for governance:
- MAJOR: removing or redefining a principle or governance rule in a way that
  changes compliance expectations.
- MINOR: adding a new principle or section, or materially expanding required
  guidance.
- PATCH: clarifications, wording fixes, or non-semantic template alignment.

Every feature plan MUST include a Constitution Check. Reviews MUST verify that
specs, plans, tasks, commits, and implementation evidence satisfy the active
constitution. If compliance cannot be fully proven, the gap MUST be listed with
an owner or a release-blocking rationale.

**Version**: 1.2.0 | **Ratified**: 2026-06-03 | **Last Amended**: 2026-06-04
