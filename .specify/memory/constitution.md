<!--
Sync Impact Report
Version change: unratified template -> 1.0.0
Modified principles:
- Placeholder Principle 1 -> I. Spec-Led User Value
- Placeholder Principle 2 -> II. Minimal, Explicit Architecture
- Placeholder Principle 3 -> III. Verifiable Increments
- Placeholder Principle 4 -> IV. Data Protection and Security by Default
- Placeholder Principle 5 -> V. Operable, Maintainable Systems
Added sections:
- Technical Standards
- Development Workflow
Removed sections:
- Placeholder Section 2
- Placeholder Section 3
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
and validated on its own. This keeps decisions tied to user value instead of
incidental implementation detail.

### II. Minimal, Explicit Architecture
Plans MUST describe the selected project structure, real source paths, runtime
boundaries, dependencies, and rejected alternatives before implementation begins.
New frameworks, services, packages, data stores, or abstractions MUST be justified
by a concrete requirement or documented constraint. Simpler local code is required
when it satisfies the same behavior with less operational or maintenance burden.

### III. Verifiable Increments
Each user story MUST include an independent verification path before it is marked
complete. Behavior that crosses module, API, persistence, security, or user-facing
boundaries MUST have automated tests unless the plan documents why automation is
not practical and gives an equivalent manual validation procedure. Tests or
validation steps MUST be added before or alongside implementation tasks, and known
test gaps MUST be recorded before release.

### IV. Data Protection and Security by Default
Features that read, write, transmit, or expose data MUST define ownership,
retention, authorization, validation, and error-handling expectations in the spec
or plan. Secrets MUST never be committed, logged, or embedded in generated
artifacts. User-visible failures MUST avoid leaking sensitive implementation
details while still providing actionable recovery paths.

### V. Operable, Maintainable Systems
Delivered work MUST include the operational hooks needed to diagnose, support, and
evolve it: clear configuration, meaningful error handling, useful logs or metrics
where behavior can fail in production, and documentation for new workflows or
manual steps. Changes MUST follow the existing repository patterns unless the plan
documents why a different pattern is necessary. Long-term maintenance costs count
as part of the feature design, not as polish.

## Technical Standards

Technology choices MUST be recorded in the implementation plan with language and
version, primary dependencies, storage, test command, target platform, performance
constraints, and deployment or runtime assumptions. Generated or hand-written code
MUST use existing repository conventions once application code exists. Until a
stack is established, plans MUST choose conservative defaults and keep dependencies
minimal.

All feature artifacts MUST use concrete paths, commands, and validation steps.
Placeholders such as NEEDS CLARIFICATION are allowed only when the missing answer
blocks an implementation decision; the plan or spec MUST list the question and
its impact.

## Development Workflow

Work proceeds in this order: specification, clarification when needed, plan,
tasks, implementation, verification, and review. The Constitution Check in each
plan is a gate before Phase 0 research and MUST be re-evaluated after Phase 1
design. Any violation MUST be documented in Complexity Tracking with the reason,
the simpler alternative considered, and the mitigation.

Tasks MUST be grouped by independently testable user story, with foundational
work limited to prerequisites that block multiple stories. Each story MUST end at
a checkpoint where its behavior can be demonstrated or validated without relying
on unfinished lower-priority stories.

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
specs, plans, tasks, and implementation evidence satisfy the active constitution.
If compliance cannot be fully proven, the gap MUST be listed with an owner or a
release-blocking rationale.

**Version**: 1.0.0 | **Ratified**: 2026-06-03 | **Last Amended**: 2026-06-03
