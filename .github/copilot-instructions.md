# Copilot instructions for this repository

This repository is a static HTML/CSS/JavaScript resort booking app powered by Supabase.

## Project context
- The frontend is in `frontend/` and runs as a static site.
- The database schema lives in `supabase/schema.sql`.
- Authentication and database access are handled via Supabase.
- There is no backend server or build pipeline required for normal development.

## Required practices
- Keep code in vanilla JavaScript unless a task explicitly asks for another stack.
- Use the browser-safe Supabase anon key only.
- Do not expose secrets or service-role keys in front-end code.
- Prefer minimal, page-scoped changes.
- Preserve the current structure and naming patterns used by the project.

## Local validation
- Run the app through a local static server so browser requests can access Supabase.
- Confirm that form flows and page loads work after changes.
- Validate the relevant page and script, not the whole project blindly.

## Security
- Never copy secret keys into any repository file.
- Keep all data access rules aligned with the database policies defined in `supabase/schema.sql`.
