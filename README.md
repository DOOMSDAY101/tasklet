# Tasklet

A tiny task list used as the test project for DevCrew's agents.

- `apps/api`: Express + TypeScript API on port 4000 (in-memory store)
- `apps/web`: Next.js + TypeScript app on port 3000 (proxies `/api/*` to the API)

## Run it

```bash
npm install
npm run dev:api     # terminal 1
npm run dev:web     # terminal 2
npm test            # API tests
npm run typecheck   # type-check both apps
npm run build       # build both apps
```

## Known state (on purpose)

Two API tests fail at the start. They are seeded bugs for Forge to fix:
1. `POST /tasks` accepts an empty title.
2. `DELETE /tasks/:id` returns 204 for a task that does not exist.

## Sample feature requests for Forge

- Add `GET /tasks?status=done|open` filtering, with tests.
- Show a "done" filter on the web page.
