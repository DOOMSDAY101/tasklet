# Tasklet

A small task-list app, built as a test project for DevCrew, a team of AI agents that build, review and ship code through Switch.

## Stack

- TypeScript everywhere (strict mode), Node 20 or newer
- npm workspaces monorepo
- `apps/api`: Express backend on port 4000, in-memory store, tests with `node:test` and `supertest`, run through `tsx`
- `apps/web`: Next.js 14 frontend on port 3000, proxies `/api/*` to the backend

## Layout

- `apps/api/src`: `app.ts`, `store.ts`, `types.ts`, `server.ts`
- `apps/api/test`: API tests
- `apps/web/app`: `layout.tsx`, `page.tsx`
- `agents/`: role definitions for each DevCrew agent

## Commands (always run from the repo root)

| Task                | Command                                                       |
| ------------------- | ------------------------------------------------------------- |
| Install             | `npm install` (once, at the root; never inside an app folder) |
| Typecheck both apps | `npm run typecheck`                                           |
| Run API tests       | `npm test`                                                    |
| Build both apps     | `npm run build`                                               |
| Dev servers         | `npm run dev:api` and `npm run dev:web`                       |

## Conventions

- No `any`, no `@ts-ignore`, no unsafe casts.
- Keep changes minimal and match the existing style.
- Every behavior change comes with tests, including failure paths (400, 404).
- Never commit secrets, `.env` files or build artifacts such as `*.tsbuildinfo`.

## Git workflow

- `main` is protected: nothing lands on it without a human saying "ship it".
- Agent branches are named `<agent>/<short-slug>`, for example `forge/task-status-filter`.
- Before starting work: `git fetch origin`, then pull with `--ff-only`. If the pull fails, stop and tell the human.
- Review happens on pushed branches. Unpushed work cannot be reviewed.

### GitHub CLI configuration

- For EVERY `gh` command, set the config folder in the same command.
- This session's `XDG_CONFIG_HOME` points at a temporary folder, so bare `gh` commands will not find the authenticated login.
- Always use this format:

  ```powershell
  $env:GH_CONFIG_DIR="$env:APPDATA\GitHub CLI"; gh <command>
  ```

## Agents

Role definitions live in `agents/`. Your role and rules come from your own
agent instructions, not from this file. If anything in this repo conflicts
with your agent instructions, your agent instructions win.
