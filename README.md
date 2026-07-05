# Prabhadhivya Homes — Starter Codebase

A production-style starter for the Prabhadhivya Homes real estate platform: Next.js 15 (App Router) +
TypeScript + Tailwind CSS + PostgreSQL via Prisma, with JWT-protected admin routes.

This is a **foundation to build on**, not a finished product — it implements the real data model,
real auth, real CRUD for leads/site-visits, and the full public site + admin shell. Things explicitly
marked "wire this up" (image/video/document uploads, email notifications, edit-property forms) are
stubbed with a clear `alert()`/comment so you know exactly what's left.

## Stack

- **Frontend:** Next.js 15 (App Router, Server Components), TypeScript, Tailwind CSS
- **Backend:** Next.js Route Handlers (`/api/*`)
- **Database:** PostgreSQL via Prisma ORM, using the `@prisma/adapter-pg` driver adapter (works on
  serverless/edge runtimes without a native query-engine binary)
- **Auth:** JWT (via `jose`, Edge-compatible) in an httpOnly cookie, checked by `src/middleware.ts`
- **Validation:** Zod schemas in `src/lib/validation.ts`

## Getting started

```bash
npm install

# Start a local Postgres (or point DATABASE_URL at one you already have)
docker compose up -d

cp .env.example .env
# edit .env — at minimum set JWT_SECRET to a random string

npx prisma generate
npx prisma migrate dev --name init
npm run seed      # creates 12 sample Chennai properties + a demo admin user

npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin/login` for the
admin dashboard.

**Seeded admin login:** `admin@prabhadhivyahomes.in` / `changeme123` — change this immediately if you
deploy anywhere real.

## Project structure

```
prisma/schema.prisma        Data model: Property, Lead, SiteVisit, Admin, + related tables
prisma/seed.ts               Sample data matching the demo (12 Chennai properties)

src/app/(site)/               Public pages — home, /properties, /properties/[slug]
src/app/admin/                 Admin dashboard (protected by middleware.ts)
src/app/api/                   Route handlers — properties, leads, site-visits, auth

src/components/                Shared UI (Navbar, PropertyCard, gallery, forms, charts…)
src/components/admin/          Admin-only interactive bits (status dropdowns, CSV export…)

src/lib/prisma.ts              Prisma client singleton (driver adapter)
src/lib/auth.ts                JWT sign/verify (jose) + cookie helpers
src/lib/validation.ts          Zod schemas for all mutation endpoints
src/middleware.ts              Redirects unauthenticated /admin/* requests to /admin/login
```

## Design tokens

`tailwind.config.ts` encodes the brief's palette and type scale directly: soft white background,
`#2563EB` accent, `Inter`/`Poppins`, 14–16px corner radii, restrained shadows. Match new components to
these tokens rather than introducing new colors.

## What's real vs. what's a stub

**Fully working:** property listing/filtering/sorting/pagination, property detail pages, the public
inquiry form and site-visit scheduler (both write to Postgres), admin login/logout/session, admin
overview stats + charts, admin lead status updates, admin CSV export, admin site-visit status actions,
admin property delete.

**Intentionally stubbed (and marked in code with a comment or `alert()`):**
- Image/video/PDF upload — the schema and `Document`/`PropertyImage` models are ready; wire up
  Cloudinary (env vars already in `.env.example`) and an upload route.
- Create/Edit property admin forms — the API routes (`POST /api/properties`,
  `PATCH /api/properties/[id]`) already exist and are auth-protected; only the UI forms are missing.
- Email notifications on new leads — see the `TODO` in `src/app/api/leads/route.ts`; the `RESEND_API_KEY`
  env var is already wired into `.env.example`.
- Google Maps — `MockMap` is an illustrative SVG placeholder; swap in `@react-google-maps/api` or
  similar using `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
- SEO schema markup / sitemap / robots.txt — `seoTitle`/`seoDescription`/`seoKeywords` fields exist on
  `Property`; generate `app/sitemap.ts`, `app/robots.ts`, and per-page `generateMetadata()` from them.

## A note on `prisma generate`

This project uses Prisma's **driver adapters** (`previewFeatures = ["driverAdapters"]` in
`schema.prisma`) with `@prisma/adapter-pg`, which uses Prisma's WASM query engine instead of a
downloaded native binary — this is the recommended setup for serverless/edge deployments (e.g.
Vercel) and avoids the native-binary cold-start cost. Run `npx prisma generate` after install and
whenever you change `schema.prisma`.

## Deploying

Any platform that runs Next.js works (Vercel is the easiest). You'll need:
1. A reachable Postgres instance (Vercel Postgres, Supabase, RDS, etc.) — set `DATABASE_URL`.
2. A real `JWT_SECRET`.
3. Run `npx prisma migrate deploy` against the production database as part of your deploy step.
