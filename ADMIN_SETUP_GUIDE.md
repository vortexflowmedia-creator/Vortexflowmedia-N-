# VortexFlow Media — Admin Panel Setup Guide

This adds a username+password protected admin page where you can edit pricing, contact info, and stats live — no redeploys needed. Changes save to **Supabase** and appear on your site immediately.

## Architecture

```
Browser                          Vercel (serverless)        Supabase
──────                          ──────────────────          ────────
Public pages ──supabase client──>  (reads directly)  ───────> SELECT (anon OK)
Admin page  ───POST /api/admin/login ───> check user+pass ─> (no DB)
             ───PUT /api/content ────────> verify token ───> UPSERT (service_role)
```

- **Public pages**: Supabase JS client (CDN) reads `site_content` table directly — RLS allows SELECT for everyone.
- **Admin page**: Username + password verified by a Vercel serverless function. Writes use Supabase service_role key (never exposed to the browser).

## Files included

| File | What it does |
|------|-------------|
| `supabase-schema.sql` | Create the `site_content` table + seed data + RLS policies |
| `api/admin/login.js` | Vercel function — verifies username+password, returns a signed token |
| `api/admin/_verify.js` | Shared helper — validates session tokens |
| `api/content.js` | Vercel function — GET (public) + PUT (admin-only) content with rate limiting + input sanitization |
| `admin.html` | Username + password login + dashboard for editing content |
| `gear-snippet.html` | Admin gear icon (already added to footer on all 6 pages) |
| `live-pricing-snippet.html` | Script to make pricing/stats live from Supabase (Supabase keys already filled in) |
| `package.json` | Dependencies for Vercel functions (`@supabase/supabase-js`) |

## Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up / log in.
2. Create a **new project** (free tier works).
3. Once created, go to the **SQL Editor** tab, open `supabase-schema.sql`, copy its contents, paste into the editor, and run it. This creates the `site_content` table, seeds your pricing data, and sets up RLS policies.
4. Go to **Project Settings → API** and copy these values — you'll need them for Vercel:
   - **Project URL**
   - **anon public key**
   - **service_role key**

## Step 2 — Deploy to Vercel

1. Push your code to a GitHub/GitLab repo (the whole folder including `api/`, `package.json`, `admin.html`, etc.).
2. Import the repo on [vercel.com](https://vercel.com).
3. In the project settings on Vercel, add these environment variables:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `ADMIN_USERNAME` | `vastav23` |
| `ADMIN_EMAIL` | `vortexflowmedia@gmail.com` |
| `ADMIN_MASTER_PASSWORD` | `Vastav@232009` |
| `ADMIN_SESSION_SECRET` | A random long string (generate one at 1password.com/password-generator or run `openssl rand -hex 32`) |

4. Deploy.

## Step 3 — Gear icon already in footer

The admin gear icon (⚙) is already added to the footer of all 6 pages. You'll see it at the end of the footer links — it's subtly styled with reduced opacity until hovered.

## Step 4 — Add live pricing to public pages

Add `id` attributes to price/contact/stat elements in your HTML, then paste `live-pricing-snippet.html` before `</body>`.

### On services.html
1. Find each price element and add an `id`:
   ```html
   <p id="price-webdesign">799 onwards</p>
   ```
   Remaining: `price-video`, `price-writing`, `price-thumbnail`, `price-logo`, `price-social`

2. Paste `live-pricing-snippet.html` before `</body>`.

### On index.html
1. Add `id="stat-projects"` and `id="stat-satisfaction"` to stat elements.
2. Add `id="contact-phone-text"` and `id="contact-email-text"` to contact elements.
3. Paste `live-pricing-snippet.html` before `</body>`.

### On contact.html
1. Add `id="contact-phone-text"` and `id="contact-email-text"` to contact elements.
2. Paste `live-pricing-snippet.html` before `</body>`.

## Step 5 — Test it

1. Visit `https://vortexflowmedia.vercel.app/admin.html`
2. Enter username `vastav23` and your password.
3. Change a price, click **Save changes**.
4. Visit your live site — the new price should appear.

## Security measures built in

- **RLS policies**: Public can only SELECT (read). Only service_role can write — and that key lives only in Vercel env vars.
- **Rate limiting**: API functions block IPs exceeding 30 requests per minute.
- **Allowed keys whitelist**: Only known content keys (like `service_webdesign_price`) can be written — arbitrary key injection is blocked.
- **Input sanitization**: All values are trimmed and capped at 200 characters.
- **CORS restriction**: API only responds to `vortexflowmedia.vercel.app` and `localhost:3000`.
- **Session tokens**: Expire after 12 hours, stored in sessionStorage (cleared on tab close).
- **Security headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict `Referrer-Policy` are set via `vercel.json`.

## Extending later

To add more editable fields:
1. Insert a new row in `site_content` (via Supabase SQL Editor).
2. Add the key to the `ALLOWED_KEYS` set in `api/content.js`.
3. Add a field to `admin.html` (HTML input + add to `FIELD_IDS` array).
4. Add an `id` to the corresponding element in your public page.
5. Add the id-to-key mapping in `live-pricing-snippet.html`.
