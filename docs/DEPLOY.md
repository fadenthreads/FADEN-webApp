# Deploying FADEN

Deploy **two separate Vercel projects** from `github.com/fadenthreads/FADEN-webApp` — one for customers (`apps/web`) and one for platform admin (`apps/admin`).

## Prerequisites

1. **Supabase** — run all SQL migrations in order (`001` through `024`) in the SQL Editor.
2. **GitHub** — repo pushed to `main`.
3. **Node 20+** and **pnpm 9+** for local builds.

---

## Step-by-step: Vercel setup

### Project A — Customer web app

1. [vercel.com/new](https://vercel.com/new) → Import **FADEN-webApp**
2. **Project name:** e.g. `faden-web`
3. **Settings before deploy:**

   | Setting | Value |
   |--------|--------|
   | Root Directory | `apps/web` |
   | Framework Preset | **Next.js** (not “Other”) |
   | Install Command | *(leave default — uses `apps/web/vercel.json`)* |
   | Build Command | *(leave default — `pnpm run build` in `apps/web`)* |
   | Output Directory | **Leave empty** (do NOT set `.next` or `apps/web/.next`) |
   | Include source files outside Root Directory | **Enabled** (required for workspace packages) |

4. **Environment variables** (Production):

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   NEXT_PUBLIC_APP_URL=https://YOUR-WEB-URL.vercel.app
   NEXT_PUBLIC_RAZORPAY_KEY_ID=          (optional)
   RAZORPAY_KEY_ID=                      (optional)
   RAZORPAY_KEY_SECRET=                  (optional)
   NEXT_PUBLIC_CALCOM_NAMESPACE=         (optional)
   NEXT_PUBLIC_CALCOM_EVENT_SLUG=video-measurement
   CALCOM_API_KEY=                       (optional)
   REVALIDATE_SECRET=                    (optional)
   ```

   Values are in `apps/web/.env.local` in the repo.

5. **Deploy** → note your URL, e.g. `https://faden-web.vercel.app`

---

### Project B — Admin console

1. **Add New Project** again → same repo **FADEN-webApp**
2. **Project name:** e.g. `faden-admin`
3. **Settings before deploy:**

   | Setting | Value |
   |--------|--------|
   | Root Directory | `apps/admin` |
   | Framework Preset | **Next.js** (not “Other”) |
   | Install Command | *(leave default — uses `apps/admin/vercel.json`)* |
   | Build Command | *(leave default — `pnpm run build` in `apps/admin`)* |
   | Output Directory | **Leave empty** (do NOT set `apps/web/.next`) |
   | Include source files outside Root Directory | **Enabled** |

4. **Environment variables** (Production):

   ```
   NEXT_PUBLIC_SUPABASE_URL=          (same as web)
   NEXT_PUBLIC_SUPABASE_ANON_KEY=     (same as web)
   WEB_APP_URL=https://YOUR-WEB-URL.vercel.app
   REVALIDATE_SECRET=                 (optional, match web)
   ```

5. **Deploy** → note your URL, e.g. `https://faden-admin.vercel.app`

---

## Step-by-step: Supabase auth URLs

In **Supabase → Authentication → URL Configuration**, add **both** deployed URLs:

| | URL |
|--|-----|
| Site URL | `https://YOUR-WEB-URL.vercel.app` |
| Redirect URLs | `https://YOUR-WEB-URL.vercel.app/auth/callback` |
| | `https://YOUR-ADMIN-URL.vercel.app/auth/callback` |
| | `https://YOUR-WEB-URL.vercel.app/**` |
| | `https://YOUR-ADMIN-URL.vercel.app/**` |

---

## Step-by-step: Create your admin login

1. Open **`https://YOUR-ADMIN-URL.vercel.app/login`**
2. Sign up / sign in with your email
3. In **Supabase → SQL Editor**:

   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

4. Refresh admin — you should see the **FADEN Admin Console**

---

## What each URL is for

| URL | App | Who uses it |
|-----|-----|-------------|
| `https://faden-web.vercel.app` | Customer site | Customers, boutique owners |
| `https://faden-web.vercel.app/dashboard` | Boutique owner dashboard | Verified boutique owners |
| `https://faden-admin.vercel.app` | Platform admin | FADEN staff (`role = admin`) |

---

## Fix a broken deploy

| Error | Fix |
|-------|-----|
| `404: NOT_FOUND` with `Code: NOT_FOUND` (Vercel plain-text page) | See **Vercel NOT_FOUND** section below — this is a platform routing issue, not your Next.js 404 page |
| `apps/admin/.next` not found | Web project Root Directory must be **`apps/web`**, not `apps/admin` |
| `apps/admin/apps/web/.next` not found | Admin project Build must be **`admin`**, Output Directory **empty**, Root **`apps/admin`** |
| Login fails on mobile/production | Add redirect URLs in Supabase (see above) |
| Access forbidden on admin | Run the `UPDATE profiles SET role = 'admin'` SQL |

### Vercel `404: NOT_FOUND` (platform error)

If you see a plain page like `404: NOT_FOUND` / `Code: NOT_FOUND` with a Vercel ID (not your FADEN site design), Vercel has **no deployment to serve** on that URL.

**Most common cause (FADEN team projects):** builds succeed and show **Ready**, but the **production alias** (`faden-web-app.vercel.app`) is not assigned to any deployment. Team URLs like `faden-web-app-faden-team.vercel.app` may return **401** (Deployment Protection) while the public alias returns **404**.

**Fix (do all steps):**

1. **Settings → Deployment Protection** → set **Production** to **None** (or “Only Preview Deployments”) so the site is public.
2. **Deployments** → open the latest **Ready** deploy on `main` (commit `01b062a` or newer).
3. Click **Visit** (while logged into Vercel). If the app loads here, the build is fine.
4. Click **⋮ → Promote to Production** on that same deployment.
5. Wait 1–2 minutes, then open `https://faden-web-app.vercel.app` again.

**If “Configuration Settings differ from Project Settings” appears:** your live production deploy used old settings. After fixing settings below, you **must** Promote to Production or Redeploy — saving settings alone does not update the live site.

**Project settings (Settings → Build and Deployment):**

Turn **Override OFF** for Install / Build / Output unless you know the exact value. When Override is ON with wrong values, `vercel.json` is ignored.

| Setting | Value |
|--------|--------|
| Root Directory | `apps/web` |
| Framework Preset | **Next.js** |
| Install Command | Override **OFF** (uses `apps/web/vercel.json`) |
| Build Command | Override **OFF** |
| Output Directory | Override **OFF**, value **empty** |
| Include source files outside Root Directory | **Enabled** |

**Check in order if still broken:**

1. **Project Settings → General → Root Directory** = `apps/web` (web) or `apps/admin` (admin).
2. **Framework Preset** = **Next.js** (if set to “Other”, change it and redeploy).
3. **Output Directory** = **empty** — never `apps/web/.next` or `.next` when Root Directory is already `apps/web`.
4. **Include source files outside of the Root Directory** = **Enabled** (monorepo workspace packages live in `packages/`).
5. **Settings → Domains** — confirm `faden-web-app.vercel.app` is on **this** project. Remove and re-add the domain if needed.
6. **Redeploy** without build cache: Deployments → ⋮ → Redeploy → uncheck “Use existing Build Cache”.

**Last resort:** delete the Vercel project and re-import the repo with Root Directory `apps/web` from the first deploy screen.

**Live URLs (example):**

| App | Production URL |
|-----|----------------|
| Web | https://faden-web-app.vercel.app |
| Admin | *(create second project — see Project B above)* |

---

## Local development

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:3000
- Admin: http://localhost:3001

---

## Environment variable reference

### Web (`apps/web`)

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (payments) | Server-only |
| `NEXT_PUBLIC_APP_URL` | Recommended | Your deployed web URL |
| `RAZORPAY_*` | Production | Omit for simulated checkout in dev |
| `NEXT_PUBLIC_CALCOM_*` | Video fittings | Optional |
| `REVALIDATE_SECRET` | Recommended | Cache bust when admin approves boutique |

### Admin (`apps/admin`)

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Same Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | |
| `WEB_APP_URL` | Recommended | Your deployed **web** URL |
| `REVALIDATE_SECRET` | Recommended | Must match web if used |

Never expose `SUPABASE_SERVICE_ROLE_KEY` or `RAZORPAY_KEY_SECRET` on the admin project.
