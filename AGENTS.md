# AGENTS.md

## Project overview
This repository is a static frontend reservation website for Mac Van Mae Resort, backed by Supabase for authentication, database storage, and row-level security.

## Important repo structure
- `frontend/`: static HTML, CSS, and vanilla JavaScript files for the app UI.
- `frontend/js/`: page logic, auth flows, reservation logic, and Supabase client setup.
- `frontend/css/`: page-specific styles.
- `supabase/schema.sql`: database schema and security policies.
- `README.txt`: main setup instructions for the project.

## Working rules for agents
- Keep changes within the static frontend architecture. This project does not have a Node/Express backend.
- Prefer plain HTML, CSS, and vanilla JavaScript unless the task clearly requires a framework.
- Do not add Supabase secret or service-role keys into browser code.
- Use the publishable anon key only in `frontend/js/supabase.js`.
- Preserve the existing page structure and naming conventions unless the task explicitly calls for refactoring.

## Setup and validation
- Use Supabase SQL Editor to run `supabase/schema.sql` before testing authenticated flows.
- Update `frontend/js/supabase.js` with the project URL and anon key.
- Serve the site using a local static server rather than opening files directly with `file://`.
- Typical local validation: run a simple static server from the repo root and confirm pages render and client-side flows work in a browser.

## Coding guidance
- Make the smallest reasonable change that solves the issue.
- When editing JavaScript, focus on the specific page and script that owns the behavior.
- Keep styling scoped to the relevant page stylesheet when possible.
- Favor clear variable names and small, focused functions.
- Before finalizing a UI fix, verify the page still loads and any affected user flow still works.

## Example commands
- From the project root:
  - `python -m http.server 8000`
  - then visit `http://localhost:8000/frontend/`
- Optional formatting:
  - `npx prettier --write frontend/**/*.js frontend/**/*.css frontend/**/*.html`

## Constraints
- Do not commit or expose real Supabase credentials.
- Do not change the database schema unless the task specifically requires it and the app logic matches the change.
- Do not introduce frameworks or build tooling for a simple static site unless explicitly requested.
