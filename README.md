# FADEN

Production monorepo for the FADEN boutique discovery and custom-fashion platform.

## Stack

- **Monorepo:** Turborepo + pnpm
- **Apps:** `apps/web` (customer + boutique), `apps/admin` (admin console)
- **Packages:** `@faden/ui`, `@faden/utils`, `@faden/database`, `@faden/validators`, `@faden/types`

## Getting Started

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:3000
- Admin: http://localhost:3001

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Lint all workspaces |
| `pnpm typecheck` | Typecheck all workspaces |

Copy `.env.example` to `apps/web/.env.local` and `apps/admin/.env.local` for local development.

## Phases

| Phase | Focus |
|-------|--------|
| **1** | Monorepo, design system, landing + opening animation |
| **2** | Database, auth, boutique registration, admin verification |
| **3** | Live verified boutiques on discovery + profile pages, owner dashboard status |
| **4** | Customization requests, orders, messaging |
| **5** | Quotations, payments (Razorpay or dev simulate), order fulfillment status |
| **6** | Customer reviews, boutique matching, deployment guide |

Run SQL migrations in order in Supabase: `001_phase2.sql`, optional fixes `002`/`003`, then **`004_phase3_public_boutique_reads.sql`**, **`005_phase4_operations_rls.sql`**, **`006_phase5_payments_rls.sql`**, **`007_boutique_customer_profiles_rls.sql`**, **`008_boutique_modification_requests.sql`**, and **`009_phase6_reviews_rls.sql`**.

For payments, add `SUPABASE_SERVICE_ROLE_KEY` to `apps/web/.env.local` (see `.env.example`). Razorpay keys are optional — omit them for simulated checkout in development.

Production deployment: see [docs/DEPLOY.md](docs/DEPLOY.md).
