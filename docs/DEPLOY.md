# Deploying FADEN

This guide covers production deployment for the **web** app (`apps/web`, port 3000) and **admin** app (`apps/admin`, port 3001).

## Prerequisites

1. **Supabase project** with all SQL migrations applied in order through `009_phase6_reviews_rls.sql`.
2. **Environment variables** copied from `.env.example` into each app’s `.env.local` (or your host’s secret store).
3. **Node.js 20+** and **pnpm 9+** for local builds.

## Required environment variables

### Web (`apps/web`)

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (payments) | Server-only; used by payment API routes |
| `RAZORPAY_KEY_ID` | Production | Omit for simulated checkout in dev |
| `RAZORPAY_KEY_SECRET` | Production | Server-only |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Production | Same as `RAZORPAY_KEY_ID` |
| `REVALIDATE_SECRET` | Recommended | Bust discovery cache when admin approves a boutique |
| `WEB_APP_URL` | Recommended | Public URL, e.g. `https://faden.example.com` |

### Admin (`apps/admin`)

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Same Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | |
| `REVALIDATE_SECRET` | Recommended | Must match web if using cache revalidation |
| `WEB_APP_URL` | Recommended | Used after boutique approval |

## Vercel (recommended)

Deploy **two separate Vercel projects** from the same monorepo:

### Web project

- **Root directory:** `apps/web`
- **Build command:** `cd ../.. && pnpm install && pnpm --filter web build`
- **Install command:** `pnpm install`
- **Output:** Next.js default

### Admin project

- **Root directory:** `apps/admin`
- **Build command:** `cd ../.. && pnpm install && pnpm --filter admin build`

Set all env vars in each project’s Vercel dashboard. Never expose `SUPABASE_SERVICE_ROLE_KEY` or `RAZORPAY_KEY_SECRET` to the browser.

## Post-deploy checklist

1. Promote an admin user in Supabase SQL:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-admin@email.com';
   ```
2. Register and verify at least one boutique via admin console.
3. Smoke-test: customize → match/connect → quote → pay → fulfill → review.
4. Configure Razorpay webhook URL (optional) — current flow verifies payments client-side after checkout.

## Local production build

```bash
pnpm install
pnpm build
pnpm --filter web start    # :3000
pnpm --filter admin start  # :3001
```
