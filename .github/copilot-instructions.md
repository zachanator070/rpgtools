# Copilot instructions — rpgtools

Purpose: short, actionable guidance so an AI coding agent can be productive immediately in this repo.

Architecture (big picture)
- **Monorepo (npm workspaces)**: `packages/*` contains `server`, `frontend`, and `common`.
- **Server** (`packages/server`): TypeScript, compiled with `tsc` into `packages/server/dist`. GraphQL server (see `gql-server-schema.ts`), Inversify DI (`di/` + `injectable-types`), domain model in `domain-entities/`, persistence in `dal/` (repositories), and services in `services/` (see `services/game-service.ts` for patterns).
- **Frontend** (`packages/frontend`): React + TypeScript + Webpack (`webpack.config.cjs`), Apollo client for GraphQL. Shared GraphQL fragments/constants live in `packages/common`.
- **Electron packaging** uses the built server and frontend assets (see root `package.json` and `Makefile` targets for `electron-*`).

Key workflows / commands
- Setup env: copy `.env.example` → `.env` (`cp .env.example .env`). Many `make` targets expect `.env` present.
- Install deps (workspaces): `npm ci` at repo root or `make dev-deps` (Makefile target).
- Run development (recommended): `make dev` — builds containers for dev and runs server + frontend bundler with watchers.
- Lightweight local dev without Docker:
  - Server dev (watch): `npm run dev --workspace=packages/server` (uses `nodemon` + `tsc`).
  - Frontend dev (watch): `npm run start-dev --workspace=packages/frontend` (webpack -w).
- Build server: `npm run build --workspace=packages/server` or `make server-js`.
- Build frontend (prod bundle): `NODE_ENV=production npm run --workspace=packages/frontend start` (used by Makefile `prod-ui`).
- Run tests:
  - Unit: `make test-unit` or `npm run test:unit --workspace=packages/server`.
  - Integration: `make test-integration` (spins up Postgres as needed). See `Makefile` for environment handling (`TEST_ENV_FILE`).
  - E2E: `make test-e2e` (runs cypress against a running server or the electron app depending on target).
- Seed & dumps: `make seed-middle-earth`, `make seed-new`, or `npm run -w packages/frontend seed:middle_earth` (seed scripts in `dev/scripts`).

Project-specific patterns & conventions
- **Dependency injection**: Look for `@injectable()` classes and `@inject(INJECTABLE_TYPES.xxx)`. Add bindings in the DI container if creating new services.
- **Factories & domain entities**: Domain objects are constructed by Factory classes (e.g., `GameFactory`, `StrokeFactory`). Use factories for persistence model instances.
- **Repositories**: DB access is through repository objects under `dal/`. Prefer repository methods (e.g., `gameRepository.findOneById`) rather than raw DB queries.
- **Authorization**: Services and resolvers use `SecurityContext` and `AuthorizationService`. Check `authorization` logic before returning sensitive data.
- **Events & Subscriptions**: Server publishes domain events via an `EventPublisher` (see `resolvers/subscription-resolvers.js`) — use those constants when emitting subscription updates.
- **GraphQL structure**: Types/TypeDefs and resolvers are assembled in `gql-server-schema.ts`. New resolvers go in `src/resolvers/` and must be exported/registered.
- **Frontend usage**: Shared GraphQL fragments and constants are in `packages/common/src` (import from `@rpgtools/common`). The frontend expects certain backend schema shapes matching those shared fragments.
- **Build output placement**: Server dist and frontend build are placed into `packages/server/dist` and consumed by Docker/Electron; do not edit generated files there.

Files to inspect when onboarding or making changes
- `Makefile` — authoritative for common workflows, CI, test orchestration, and Docker targets.
- `packages/server/src/index.ts` and `gql-server-schema.ts` — server bootstrap and GraphQL wiring.
- `packages/server/src/resolvers/` — GraphQL resolvers and subscription event names.
- `packages/server/src/services/game-service.ts` — canonical example of service, DI, ACL checks, publishing events, and repository usage.
- `packages/common/src/*` — shared queries, fragments, constants used by frontend and server.
- `packages/frontend/webpack.config.cjs` and `packages/frontend/src/index.tsx` — frontend build + entry point.
- `dev/scripts/seed.sh` and `dev/scripts/dump.sh` — DB seeding and dumps; useful for integration/e2e.

Do / Don't quick list
- Do run `make` targets for integration and e2e tests — they orchestrate env vars and dockerized dependencies.
- Do prefer repository and factory APIs to construct/persist domain entities.
- Don't modify files in `packages/*/dist` — those are build outputs.
- Don't assume environment variables are present — copy `.env.example` when testing locally.

If something in these notes is unclear or you need more detail (e.g., where to bind a new injectable, how to add a resolver, or which test target to run for a specific change), tell me what area you're changing and I'll expand this file with small, targeted examples.
