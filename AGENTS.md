## Project Overview

This project is a technical assessment built with NestJS, TypeScript, Drizzle ORM, PostgreSQL, Zod, and Docker.

It exposes a REST API that enables:
- Creating and managing meeting rooms
- Reserving time slots for these rooms
- Querying availability
- Viewing usage statistics

The project focuses on maintainability, clear domain boundaries, and type safety.

Implementation depth is intentionally macro-level; correctness, structure, and clarity are prioritized.

## Build & Test Commands

Development
- pnpm install
- pnpm start:dev

Linting & Formatting
- pnpm lint
- pnpm format

Testing
- pnpm test  
- pnpm test:int

Build
- pnpm build

CI pipeline
- Lint
- Format check
- Unit tests
- Integration tests
- Build

## Code Style & Quality

TypeScript
- Use strict mode ("strict": true in tsconfig.json).
- Prefer inline types when used once; extract named interfaces only when reused.
- Avoid as assertions; if unavoidable, document why.
- Use any only for untyped external data (e.g., JSON from APIs) and narrow immediately.
- Prefer destructuring for imports and variables.

Design Principles
- Keep functions small; avoid deep nesting.
- Prefer early returns to reduce conditional complexity.
- Eliminate duplication aggressively (DRY).
- Follow SOLID principles; functions and classes should have one responsibility.
- Avoid side effects; if necessary, isolate them in dedicated modules.

Naming Conventions
- Element	Convention	Example
- Classes	PascalCase	UserService
- Functions / Variables	camelCase	getUserById
- Constants	UPPER_SNAKE_CASE	MAX_ROOM_CAPACITY
- Interfaces	Prefix with I	IUserRepository
- Abstract classes	Prefix with Abstract	AbstractRepository
- DTOs	Suffix with DTO	CreateRoomDTO

Tooling
- Use Biome strictly configured for linting and formatting.
- No Husky or Commitlint setup for now.

## Architecture & Responsibilities

Layers
- Controller → Service → Repository
- Each feature lives in its own Nest module, encapsulating its domain.

Controllers
- Handle request validation (Zod-based pipes), authentication/guards, and map DTOs ↔ domain.
- No business logic here.

Services
- Orchestrate workflows and contain business logic.
- Compose repositories and domain services when needed.

Repositories
- Handle persistence with Drizzle.
- Return typed entities or plain objects.
- Never throw; return null or domain-specific error objects.

Zod Integration
- Each DTO must have an associated Zod schema located under /schemas.
- Derive TypeScript types from Zod using z.infer<typeof schema>.
- Controllers use Zod validation pipes at the boundary (request body, params, query).

## API Design

REST Conventions
- Use plural resource names (/rooms, /reservations).
- Keep endpoints stateless and idempotent when applicable.
- Maintain consistent HTTP status codes:
	- 200 OK – Successful read
	- 201 Created – Resource created
	- 204 No Content – Successful deletion
	- 400 Bad Request – Validation error
	- 404 Not Found
	- 500 Internal Server Error

- Response Format
Every endpoint must return a consistent envelope:

{
  "data": {},
  "meta": {},
}

If an error occurs

{
  "data": null,
  "meta": {},
  "error": {
    "code": "ROOM_NOT_FOUND",
    "message": "The specified room does not exist."
  }
}

Documentation
- Use Swagger (@nestjs/swagger) to expose API documentation.
- Keep all DTOs and responses documented.
- Generated documentation should reflect the public contract (not internal models).

## Security
- Validate all inputs (body, params, and query).
- Never expose stack traces or internal messages in production.
- Use the existing configuration layer
- Secrets handled in shared/env.ts (validated by Zod)
- Accessed through Nest’s ConfigService
- Enforce TLS in production environments.
- Add a note for future implementation:

// TODO: Add Helmet and rate limiting for production

## Performance
- Add indexes to frequently queried columns.
- Never use SELECT *; explicitly specify required fields.
- Keep naming consistency in the database:
- Tables and columns use snake_case.
- Primary keys follow {table}_id pattern.
- Avoid unnecessary joins; prefer multiple simple queries when possible.

## Drizzle & Database Layer
- Database schemas live under src/db/schema.
- Each domain can re-export its subset from its own *.schema.ts file.
- Always inject NodePgDatabase<typeof schema> via a provider (never instantiate pools manually).
- Naming convention:
	- Tables → plural snake_case
	- Columns → snake_case
	- Foreign keys → {referenced_table}_id
	- Development-only setup — no migrations or transactions beyond simple use cases.

## Testing

Scope
	- Unit tests: Required for business logic and utilities.
	- Integration tests: Required for DB access, repository logic, and module interactions.
	- E2E tests: Optional; can be added using supertest or similar.

Principles
	- Tests should describe behavior, not implementation.
	- Cover edge cases and error paths.
	- Use typed factories/builders for DTOs instead of any.
	- Stub or mock external I/O (HTTP, DB, queues).
	- Favor black-box tests for services and repositories.