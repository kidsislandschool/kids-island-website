# Kids Island Senior Secondary School — Website & Master Admin CMS

A complete Next.js 16 website with a database-backed Master Admin CMS for Kids Island Senior Secondary School, Aligarh.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, React 19) |
| Styling | Tailwind CSS v4 |
| Database | SQLite (`better-sqlite3`) with hand-rolled migrations |
| Auth | Custom: scrypt password hashing, hashed session tokens, httpOnly cookies, rate limiting, login lockout |
| Animations | Framer Motion (reveals, crossfades), GSAP 3.15 (pinned scroll sequences) |
| Validation | Zod v4 (server + client) |
| Build tooling | Turbopack, TypeScript, tsx (CLI scripts) |

## Quick start

```bash
# 1) Install dependencies
npm install

# 2) Configure environment (creates .env.local from .env.example)
cp .env.example .env.local
# Edit .env.local if you need a different database path, upload folder or site URL.

# 3) Bootstrap the Master Admin (generates a strong random password)
npm run bootstrap
# -> Writes credentials to data/initial-admin.txt
#    Email: admin@kids-island.local
#    Password: (printed in the file)

# 4) Start the dev server
npm run dev
# Open http://localhost:3001

# 5) Sign in at /staff-login with the credentials from data/initial-admin.txt
#    Then change your password under /admin/account.
#    Delete data/initial-admin.txt after the first successful sign-in.
```

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Yes | `http://localhost:3001` | Public site URL used for metadata, sitemap and canonical links. |
| `DATABASE_PATH` | No | `./data/kids-island.db` | SQLite file (relative to project root or absolute). |
| `UPLOAD_DIR` | No | `./public/uploads` | Folder for uploaded images/PDFs. **Must live inside `./public`** so Next.js can serve them. |
| `ADMIN_EMAIL` | Bootstrap only | `admin@kids-island.local` | Master Admin email (used by `npm run bootstrap` / `npm run reset-admin`). |
| `ADMIN_NAME` | Bootstrap only | `Master Admin` | Display name for the Master Admin account. |
| `ADMIN_PASSWORD` | Bootstrap only | *(generated)* | If omitted, a strong password is generated and written to `data/initial-admin.txt`. |
| `NODE_ENV` | No | `development` | Set to `production` when deployed behind HTTPS (enables `secure` cookies). |

> **Never commit `.env.local`** — it is git-ignored. The template `.env.example` is safe to commit.

## Database & migrations

- The SQLite database is created on first access at `DATABASE_PATH`.
- Migrations run automatically via a tiny runner (`src/lib/db.ts`) keyed by `PRAGMA user_version`.
- Seeding runs on first startup (`seedIfEmpty`) and inserts the extracted site content.
- **Unverified content** (statistics, testimonials, FAQs, affiliation claims, eligibility rules) is seeded with status `needs_review` and **never appears on the public site** until a Master Admin publishes it.
- To re-seed (development only):
  ```bash
  npm run db:seed -- --force
  ```
  This overwrites statuses and replaces seeded testimonials/FAQs. Do not use on a production database.

## Master Admin bootstrap / password reset

| Command | Purpose |
|---------|---------|
| `npm run bootstrap` | Creates the single Master Admin account. Writes one-time credentials to `data/initial-admin.txt` (mode 0600). |
| `npm run reset-admin` | Rotates the Master Admin password, revokes all existing sessions, and writes new credentials to `data/initial-admin.txt`. |
| `npm run db:seed` | Re-runs the seed (skips if data exists). Add `--force` to overwrite. |

> **Security:** `data/initial-admin.txt` is git-ignored. Delete it after you have signed in and changed the password.

## Development

```bash
npm run dev          # Start dev server (Turbopack) on port 3001
npm run build        # Production build (runs typecheck + lint)
npm run start        # Run the built production server
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
```

### Useful scripts

```bash
npm run bootstrap        # Create Master Admin (run once per DB)
npm run reset-admin      # Rotate Master Admin password
npm run db:seed          # Seed content (safe re-run)
npm run db:seed -- --force  # Overwrite seeded content (dev only)
```

## Deployment

### Server requirements

- Node.js 20+
- Persistent disk for `data/kids-island.db` and `public/uploads/`
- HTTPS termination (reverse proxy or platform) — set `NODE_ENV=production`

### Build & start

```bash
npm run build
npm run start
```

### Docker (example)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SITE_URL=https://your-domain.com
EXPOSE 3000
CMD ["npm", "run", "start"]
```

Mount a volume at `/app/data` for the database and `/app/public/uploads` for uploads.

### Backups

- **Database:** Copy `data/kids-island.db` (and the `-shm`/`-wal` files if WAL mode is active). SQLite backups are safe while the app runs.
- **Uploads:** Back up `public/uploads/` (or your custom `UPLOAD_DIR`).
- **Credentials:** `data/initial-admin.txt` is ephemeral — do not back it up; use `npm run reset-admin` on a fresh server.

### Platform notes

- **Vercel:** Works for the web tier, but you need a separate persistent DB (Turso, Neon, SQLite on a VM) and upload storage (S3/R2). Adjust `getUploadRoot`/`getUploadUrlPrefix` in `src/lib/uploads.ts` for object storage.
- **Traditional VM / Docker / Railway / Render:** Mount a persistent volume for `./data` and `./public/uploads`.

## Uploads & media

- Images (JPG, PNG, WebP, AVIF ≤ 12 MB) are re-encoded to WebP (max 1800 px, quality 82) via `sharp`.
- PDFs are validated by magic bytes (`%PDF-`).
- Files are stored under `UPLOAD_DIR` (default `./public/uploads/YYYY/MM/`) and recorded in the `uploads` table.
- Admin can insert upload URLs into any `image` or `file` field across content blocks and collections.

## Admin CMS — what's included

| Section | Route | Purpose |
|---------|-------|---------|
| Dashboard | `/admin` | Stats, review queue, latest enquiries, quick actions, activity log |
| Pages overview | `/admin/pages` | Map of every public page → content blocks + collections + SEO |
| Page content | `/admin/content` | List + schema-driven editor for every content block |
| SEO | `/admin/seo` | Per-page title, description, canonical, OG image with live Google preview |
| Settings | `/admin/settings` | School details, navigation, footer, affiliation (tabbed) |
| Admissions desk | `/admin/admissions` | Enquiry summary, conflict callout, admission page links |
| Enquiries | `/admin/inquiries` | Searchable inbox, status workflow, detail + delete |
| Faculty | `/admin/faculty` | Profiles (name, role, subjects, photo, bio, order) |
| Study materials | `/admin/materials` | Class/subject filterable resources, file/URL uploads |
| Gallery | `/admin/gallery` | Albums + photos (cover, alt text, featured, ordering) |
| Notices | `/admin/notices` | Pinned/events/holidays/exams/results with publish date |
| Testimonials | `/admin/testimonials` | Parent/student quotes (seeded as *needs review*) |
| FAQs | `/admin/faqs` | Q&A for contact/admissions pages (seeded as *needs review*) |
| Audit log | `/admin/audit-log` | Filterable log of every admin action |
| Account | `/admin/account` | Profile, password (revokes other sessions), security notes |

All admin routes and APIs enforce **server-side** Master Admin role checks.

## Animation system

| Feature | Tech | Notes |
|---------|------|-------|
| Reveal-on-scroll | Framer Motion | `Reveal` / `RevealGroup` / `RevealItem` components, shared durations |
| Crossfade slideshows | Framer Motion | Hero slides, gallery grids, `DURATION.crossfade` |
| Pinned scroll sequence | GSAP ScrollTrigger | Desktop + `prefers-reduced-motion: no-preference` only; CSS fallback for mobile/reduced motion |
| Hero / map motion | GSAP | Parallax, SVG path drawing |
| Tokens | `src/lib/motion.ts` | Single source of truth for durations and easings |

### Reduced motion

- All GSAP pinned sequences and heavy parallax are disabled when `prefers-reduced-motion: reduce`.
- Framer reveals become instant opacity/translate swaps.
- CSS fallback stacks the pinned sequence panels vertically on mobile and reduced-motion clients.

## Content integrity rules

1. **No fabricated facts.** Statistics, testimonials, staff names, affiliations, eligibility rules, distances, WhatsApp numbers — anything not explicitly verified — is seeded as `needs_review` and hidden publicly.
2. **Admin review queue** surfaces every `needs_review` block on the dashboard.
3. **Affiliation conflict** (UP Board vs CBSE) is flagged prominently in the dashboard and settings; both blocks must be published manually after verification.
4. **Public getters** (`getContent`, `getPublishedTestimonials`, etc.) default to `publicOnly: true`, so draft/needs-review content never leaks.

## Security notes

- **Single Master Admin role** — no additional staff roles in this phase.
- **Password hashing:** scrypt (N=16384, r=8, p=1, 64-byte hash) via `src/lib/password.ts`.
- **Sessions:** 256-bit random tokens, SHA-256 stored in DB, httpOnly `SameSite=Lax` cookies, 7-day TTL.
- **Rate limits:** login (8/min/IP), inquiry forms (5/10 min/IP).
- **Login lockout:** 8 failed attempts → 10-minute lockout per identifier.
- **CSRF defence:** Same-origin check on all mutating API routes (`assertSameOrigin`).
- **Audit log:** Every sign-in, content change, publish, upload, delete, enquiry access is recorded with user, IP, timestamp and JSON detail.
- **Upload safety:** MIME + magic-byte validation, traversal guard on `UPLOAD_DIR`, files served from `public/` only.
- **No secrets in client bundles** — all auth logic runs on the server.

## Project structure (key directories)

```
src/
  app/
    (site)/           # Public pages (/, /about, /admissions, …)
    (auth)/           # Staff login
    admin/            # Master Admin CMS (all /admin/* routes)
    api/              # Server routes (auth, admin CRUD, uploads, inquiries)
  components/
    admin/            # CMS UI (editors, tables, modals, forms)
    layout/           # Header, footer, logo
    motion/           # GSAP + Framer wrappers (hero, pinned, map, reveal)
    sections/         # Reusable page sections (hero, stats, programs, …)
    ui/               # Design-system primitives (button, badge, icon, …)
    forms/            # Inquiry form, material filters, field components
  lib/
    auth.ts           # Session, password, rate-limit, lockout
    content.ts        # CMS content getters/setters + SEO
    collections.ts    # Declarative collection registry
    content-schema.ts # Editor schemas for every content block
    admin-data.ts     # Collection CRUD + counts
    admin-validation.ts # Server + client validation
    db.ts             # SQLite connection, migrations, seed
    seed.ts           # Extracted site content (needs_review where unverified)
    audit.ts          # Audit logging + query helpers
    motion.ts         # Shared duration/easing tokens
    uploads.ts        # Upload path resolution (traversal-safe)
    seo.ts            # Public metadata builder (CMS overrides + fallbacks)
    page-registry.ts  # Map of managed public pages ↔ content keys
    password.ts       # Scrypt helpers (shared by app + CLI)
    utils.ts          # cn(), date formatting, truncate, …
scripts/
  load-env.ts         # .env loader for CLI
  bootstrap-admin.ts  # Create Master Admin
  reset-admin.ts      # Rotate Master Admin password
  seed.ts             # Re-seed content (--force to overwrite)
data/                 # SQLite DB + generated credentials (git-ignored)
public/uploads/       # Uploaded media (git-ignored except .gitkeep)
```

## License

Internal project for Kids Island Senior Secondary School, Aligarh. Not for public reuse.