# Taskroom — WebMCP demo

Taskroom is a small frontend-only Kanban demo for testing WebMCP browser tools. Tasks are stored in the browser with `localStorage`, so there is no backend, account, or database to configure.

## What is included

- **Board** — three columns (`TO DO`, `IN PROGRESS`, `DONE`) with draggable cards.
- **Task list** — search, status filtering, sorting, and result counts.
- **New task** — create or edit tasks with title, details, and status.
- **WebMCP tools** — list, create, update, delete, and move tasks when the browser exposes `document.modelContext`.
- **Netlify-ready** — `netlify.toml` includes the Vite build command and SPA fallback route.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- `@dnd-kit/core` for drag-and-drop
- React Router
- WebMCP progressive enhancement

## Run locally

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

The app is available at `/`, with `/tasks` for the filterable list and `/tasks/new` for the task form.

## Local data

Tasks are stored under the `web-mcp-demo.tasks.v1` localStorage key. The first visit creates a few sample tasks. To reset the demo, open browser developer tools and run:

```js
localStorage.removeItem('web-mcp-demo.tasks.v1')
location.reload()
```

## WebMCP testing

WebMCP is an experimental browser feature. When `document.modelContext` is available, Taskroom registers these tools:

- `list_tasks` — search tasks by text and/or status.
- `create_task` — create a task.
- `update_task` — edit an existing task.
- `delete_task` — remove a task.
- `move_task` — move a task between board columns.

The normal interface does not depend on WebMCP and continues to work in browsers without support. WebMCP tools use the same validated task actions and localStorage state as the visible UI.

## Deploy on Netlify

Connect this repository to Netlify with:

- Build command: `npm run build`
- Publish directory: `dist`

The included `netlify.toml` rewrites client-side routes to `index.html` so direct navigation works after deployment.

## Notes

- This is intentionally a frontend-only demo; data is local to each browser profile.
- The WebMCP API is still evolving and may require a compatible Chromium-based browser or feature flag.
- The repository includes an `AGENTS.md` file with working rules for future contributors and agents.
