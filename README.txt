MAC VAN MAE RESORT - SUPABASE VERSION

This project is a frontend reservation website connected to Supabase.

TECHNOLOGIES
- HTML5
- CSS3
- Vanilla JavaScript
- Supabase Auth
- Supabase Database

SETUP
1. Create a Supabase project.
2. Open Supabase Dashboard > SQL Editor.
3. Copy and run: supabase/schema.sql
4. Open frontend/js/supabase.js.
5. Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_PUBLISHABLE_KEY with your project values.
6. Open frontend/index.html through a local web server. Do not use file:// if your browser blocks requests.
7. Register a new account.
8. Log in and make a reservation.

IMPORTANT SECURITY
Use only the Supabase publishable/anon client key in browser code.
Never put a Supabase secret/service-role key in these frontend files.

AUTHENTICATION
Supabase Auth handles passwords. Passwords are NOT stored in the profiles table.

DATABASE
The SQL file creates:
- profiles
- rooms
- reservations

It also enables Row Level Security and creates policies for public room browsing and users' own reservations.

EMAIL CONFIRMATION
If email confirmation is enabled in Supabase Auth, a user may need to confirm their email before logging in.

DEPLOYMENT
The frontend is static and can be deployed to a static host such as Netlify, Vercel, or GitHub Pages. Supabase remains the backend/database/auth service.

