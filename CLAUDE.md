# CLAUDE.md

@.claude/rules/api-conventions.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

Python is not installed on this machine. Use Node.js (v22 available):

```bash
npx serve . -p 8080
```

Open `http://localhost:8080` in the browser. The game **must** be served over HTTP — `game.js` fetches `config.json` via `fetch()` and will fail if opened as a local `file://` URL.

## Configuration

Edit `config.json` to set defaults before the server starts:

| Field | Default | Constraint |
|-------|---------|------------|
| `boardSize` | 3 | 2–5 |
| `winLength` | 3 | 2–boardSize |
| `playerX` | "Igrač X" | display name |
| `playerO` | "Igrač O" | display name |

Players can also change all settings at runtime via the in-page config panel without restarting the server.

## Git Workflow

After completing any meaningful change (new feature, bug fix, config update), always:

1. Stage only relevant files — never `git add .` blindly
2. Commit locally with a clean, descriptive message (imperative mood, under 72 chars subject line)
3. Push to `origin/master` immediately so work is never lost

```bash
git add <files>
git commit -m "Short imperative summary

Optional longer explanation if the why is non-obvious."
git push
```

Never batch unrelated changes into one commit. Each commit should represent one logical unit of work.

## Architecture

Pure client-side app — no backend, no build step, no bundler.

- **`index.html`** — all markup; board, scoreboard, controls, and config panel
- **`game.js`** — all logic and state; no external libraries
- **`style.css`** — dark-theme styling; responsive cell sizing via CSS Grid

## Architecture Philosophy
We follow Clean Architecture with CQRS separation:
- **Domain** has zero dependencies - pure business logic
- **Application** orchestrates use cases via Mediator handlers
- **Infrastructure** implements interfaces defined in Application
- **Api** is thin - just endpoint definitions and DI wiring

Why CQRS? We need different read/write models for performance.
Why Mediator? Decouples handlers from HTTP layer, enables pipeline behaviors, source-generated for better performance.

### State model (`game.js`)
Global variables drive the entire UI: `config`, `board` (2D array), `currentPlayer`, `gameOver`, `scores`.

### Key functions
- `loadConfig()` — fetches `config.json`, merges with defaults via spread, then calls `initBoard()`
- `initBoard()` — resets board and game state, calls `renderBoard()`
- `renderBoard()` — tears down and rebuilds the entire grid DOM; cell size (48–80 px) and font size scale with `boardSize`
- `checkWin(row, col)` — scans 4 directions bi-directionally from the last-placed mark; returns winning cell coordinates or `null`
- `applyNewConfig()` — validates and applies UI panel inputs, resets scores, reinitializes board


## Tech Stack
- .NET 10, ASP.NET Core Minimal APIs
- Entity Framework Core 10 with PostgreSQL
- Mediator for CQRS pattern (source-generated)
- FluentValidation for request validation
- Scalar for API documentation (OpenAPI)


## Commands
| Command | Purpose |
|---------|---------|
| npm start | Start dev server + API concurrently |
| npm test | Run Vitest test suite |
| npm run lint | ESLint + Prettier check |
| npm run db:migrate | Apply database migrations |
| npm run build | Production build |
- Build: `dotnet build`
- Test: `dotnet test --no-build`
- Run: `dotnet run --project src/Api`
- Migrations: `dotnet ef migrations add <Name> --project src/Infrastructure --startup-project src/Api`

## Conventions
- Use functional components with hooks, never class components
- All API responses follow { data, error, meta } envelope format
- File names use kebab-case: user-profile.tsx, not UserProfile.tsx
- Database queries go through the ORM, never write raw SQL
- All user-facing strings must use the i18n translation function t()

## Structure
- src/pages/ - web page
- src/components/ - React components (interactive, use client:load)
- worker/ - Cloudflare Worker backend (separate from frontend)
- migrations/ - SQL migration files for D1
- `src/Api/` - Entry point, endpoints, middleware
- `src/Application/` - Commands, queries, handlers, DTOs
- `src/Domain/` - Entities, value objects, domain events
- `src/Infrastructure/` - EF Core, external integrations
- `tests/` - Unit and integration tests

## Rules
- DO: Use Zod for all input validation
- DO: Add error handling to every async function
- DON'T: Use any - always provide explicit TypeScript types
- DON'T: Import from relative paths across module boundaries, use path aliases
- DON'T: Add console.log statements, use the logger utility
