# ProjectChron Web App

ProjectChron is a self-hosted story engine for makers. Capture block-based updates, surface highlights, and publish a scrubbable timeline for each project. This repository contains the Next.js frontend/API, Prisma data layer, and supporting worker stubs for the MVP scope described in the PRD.

## Features implemented so far

- Username/password authentication with secure Argon2id hashing and cookie sessions
- Project CRUD with private-by-default visibility, slug collision handling, and tag management
- Block-based updates (paragraph/heading/quote/list for now) with highlight toggles and timeline rendering
- Follow/unfollow endpoints plus a global feed that surfaces project creation, update publication, visibility changes, and highlight events
- Media pipeline stubs: media asset registration, admin queue inspection, and a placeholder worker loop
- Starter UI for landing page, authentication flows, maker dashboard, public gallery, project timelines, and admin queue view
- Vitest unit tests covering validation, slug generation, and password hashing helpers

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   # edit .env to point at your Postgres instance
   ```

   Required variables:

   - `DATABASE_URL` — PostgreSQL connection string (Prisma + Next.js)
   - `MEDIA_WORKER_INTERVAL` — Optional polling interval for the stub media worker (default 10s)

3. **Generate the Prisma client**

   ```bash
   npx prisma generate
   ```

4. **Run migrations (requires Postgres)**

   ```bash
   npx prisma migrate dev
   ```

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

6. **(Optional) Run the media worker stub**

   ```bash
   npm run worker
   ```

## Scripts

| Command            | Purpose                                   |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | Start Next.js dev server                  |
| `npm run build`    | Production build                          |
| `npm run start`    | Launch production server                  |
| `npm run lint`     | ESLint with Next.js config                |
| `npm run test`     | Vitest unit tests                         |
| `npm run worker`   | Poll the media queue and mark jobs ready  |

## Architecture notes

- **Next.js 16 (App Router)** for hybrid server/client rendering
- **Prisma 6** with a PostgreSQL schema tailored to the MVP feature set (projects, updates, blocks, highlights, media assets, feed, follows, audit logs)
- **Auth**: cookie-backed sessions stored in the database, Argon2id password hashing, Zod validation for all payloads
- **Styling**: Tailwind CSS v4 with custom design tokens for the dark maker aesthetic
- **Queues**: `media_jobs` table acts as the initial work queue; the TypeScript worker demonstrates polling + status transitions pending Sharp/FFmpeg integration

## Roadmap highlights

- Rich media editing (image/video blocks), upload UI, and real transcoding pipeline (MEDIA-* tickets)
- Scrubber playback heuristics, Play as Story controls, tick density tuning (TIME-* tickets)
- Admin console enhancements, password reset UI, and storage provider adapters for R2/S3/local disk
- Docker Compose packaging with Postgres, worker, and web containers (INFRA-* tickets)

## Operational disclaimers

- **No rate limiting** and **no backups** are shipped with this MVP. Operators must provision reverse proxy protections and external backups.
- The instance is private-by-default; operators are responsible for toggling public visibility per project.
- **500 MB per upload**. Transcoding is CPU intensive—follow the hardware guidance in the PRD before ingesting large video libraries.
- **Media of minors**: obtain consent and comply with local regulations. ProjectChron ships without automated moderation or blurring.

## Testing & quality

Run lint and unit tests locally before opening a PR:

```bash
npm run lint
npm run test
```

The Vitest configuration lives in `vitest.config.ts`; tests are colocated under `src/__tests__`.

## Additional documentation

Refer to the `documentation/` directory in the repository root for the full Product Requirements Document, acceptance criteria, and backlog used to drive this implementation.
