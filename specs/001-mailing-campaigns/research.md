# Research: Mailing Campaigns

## Decision: Express.js with strict TypeScript for the backend

**Rationale**: Express satisfies the required backend stack, keeps the library
surface small, and leaves routing, middleware, OpenAPI validation, and error
handling explicit.

**Alternatives considered**: Fastify was rejected because it adds a different
framework than requested. NestJS was rejected because it introduces a larger
framework and dependency surface.

## Decision: React with TypeScript and Vite for the frontend

**Rationale**: React satisfies the requested frontend stack. Vite provides a
minimal build/test setup compatible with TypeScript and Vitest.

**Alternatives considered**: Next.js was rejected because server rendering and
file-based routing are not required. UI component libraries are rejected for the
initial plan to keep dependencies minimal.

## Decision: Drizzle ORM with PostgreSQL

**Rationale**: Drizzle matches the user's ORM preference, supports PostgreSQL,
keeps schema definitions explicit, and satisfies the constitution's ORM-only
persistence rule.

**Alternatives considered**: Prisma was rejected by user preference. TypeORM was
rejected due to heavier runtime behavior and more implicit mapping.

## Decision: OpenAPI plus AJV validation

**Rationale**: OpenAPI remains the source of truth for HTTP contracts. AJV keeps
runtime validation small and can validate request and response schemas derived
from the OpenAPI document.

**Alternatives considered**: Zod was rejected because it risks making TypeScript
schemas the source of truth instead of OpenAPI. Manual validators were rejected
because they make drift from OpenAPI harder to detect.

## Decision: Short-lived bearer access tokens

**Rationale**: Bearer tokens fit web, API, and MCP clients. The user selected no
revocation feature, so the plan uses short-lived signed access tokens only.

**Alternatives considered**: Cookie sessions were rejected by user preference.
Refresh tokens and opaque database tokens were rejected because revocation is out
of scope.

## Decision: PostgreSQL-backed async send queue

**Rationale**: A send jobs table satisfies async sending without adding Redis or
another broker. A worker container can claim pending jobs, call EmailLabs, and
record outcomes.

**Alternatives considered**: Redis queue was rejected to keep infrastructure
minimal. External schedulers were rejected because the initial runtime should be
portable with Docker Compose.

## Decision: EmailLabs modern JSON REST API

**Rationale**: Current EmailLabs documentation describes a modern REST API using
JSON, OpenAPI 3.0.2 documentation, and `Application-Key` plus `Authorization`
keys. This aligns with the project's OpenAPI and JSON API direction.

**Alternatives considered**: The older `api/new_sendmail` form-encoded endpoint
with Basic auth was rejected because it conflicts with the modern JSON API
direction and would need different validation/mapping.

**Sources**:
- https://newpanel.docs.emaillabs.io/en/integrations/api
- https://emaillabs.io/produkt/emaile-transakcyjne/

## Decision: Separate backend, frontend, worker, and database containers

**Rationale**: The constitution requires separate service containers. Dockerfiles
for backend and frontend plus Docker Compose for all runtime services keep local
and deployment topology explicit.

**Alternatives considered**: A single monolithic container was rejected because it
violates container separation. Running the worker inside the API process was
rejected because it couples request handling and background sending.
