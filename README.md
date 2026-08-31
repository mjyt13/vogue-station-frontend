<div align="center">

# Vogue Station

**Design a garment in 3D — pick a model, a color, a pattern — save it, publish it, browse everyone else's.**

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![three.js](https://img.shields.io/badge/three.js-r185-000000?logo=threedotjs&logoColor=white)](https://threejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vitejs.dev)
[![NestJS](https://img.shields.io/badge/NestJS-11-e0234e?logo=nestjs&logoColor=white)](https://nestjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org)

</div>

<br>

<img src=".github/screenshots/landing.png" alt="Vogue Station landing page" width="100%">

## What this is

A full-stack pet project built to practice a real product's shape, not just a
CRUD demo: a **live 3D garment editor** (three.js) backed by a real API
(NestJS + Postgres + S3-compatible storage), with accounts, a personal
cabinet, user-submitted content, and an admin moderation queue gating what
becomes public. Two repos, split like a real product would be:

- **This repo** — the React frontend (editor, auth, cabinet, gallery, admin UI).
- [**vogue-station-backend**](https://github.com/mjyt13/vogue-station-backend) — NestJS API, Prisma/Postgres, S3 storage, JWT auth, moderation.

<img src=".github/screenshots/editor.png" alt="The garment editor: a 3D preview with model, color, and pattern controls" width="100%">

## Features

- **Live 3D customization** — swap the garment model, color, and pattern and
  watch the preview update in place; drag to orbit, pan, auto-frame, toggle a
  visible light source, and nudge position/rotation per axis. A live UV-unwrap
  preview shows exactly how the pattern tiles across the mesh.
- **Accounts** — register/login, JWT access token + rotating httpOnly refresh
  cookie, role-based access control (user / admin).
- **Bring your own assets** — upload a custom `.glb` garment model, a color,
  or a pattern image; each gets validated, thumbnailed, and is immediately
  usable by its owner.
- **Cabinet** — every look you build is saved and can be reopened, edited,
  and re-saved (or saved as a new copy) later.
- **Publish + moderation** — submit a look (or a color/pattern/model) for
  review; an admin approves or rejects it before it goes public. A look can
  only be approved once everything it references is already public.
- **Public gallery** — browse everyone's approved looks, filterable by color
  or pattern.

## Tech stack

|            | Frontend                                                                                          | Backend                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Core       | React 19, TypeScript, Vite (React Compiler)                                                        | NestJS 11, TypeScript                                                                            |
| 3D         | three.js, `@react-three/fiber`, `@react-three/drei`                                                 | —                                                                                                 |
| Data       | TanStack Query, `openapi-fetch` (typed from the backend's OpenAPI spec)                             | Prisma 7 + Postgres (via `@prisma/adapter-pg`)                                                    |
| Forms/UI   | React Hook Form + Zod, Radix UI (Dialog/Tabs/Dropdown)                                              | class-validator / class-transformer                                                              |
| Auth       | in-memory access token, `credentials: include` for the refresh cookie                              | `@nestjs/jwt`, argon2 password hashing                                                            |
| Storage    | —                                                                                                    | S3-compatible object storage (MinIO locally) via `@aws-sdk/client-s3` + presigned URLs, `sharp` for thumbnails |
| Routing    | React Router 7                                                                                       | Nest controllers, `@nestjs/throttler` rate limiting                                              |

## Architecture notes

- **Feature folders** under `src/features/<name>/`, each exporting through a
  barrel `index.ts` (a facade — import `from './features/viewer'`, never a
  file deep inside it).
- **Config-driven UI over duplication** — e.g. the 6 position/rotation
  sliders are generated from a `GROUPS × AXES` config with one `AxisSlider`
  component and one handler, not six near-copies.
- **The viewer knows nothing about the catalog.** `GarmentMaterial =
  {color, patternUrl, patternScale}` is a pure render contract; the wardrobe
  feature (colors/patterns/models) hands it one, the viewer just renders it.
- **Presigned URLs are ephemeral** (~10 min) — fetched right before use,
  never persisted, refetched on a storage 403.

## Getting started

You'll need both repos running — this one and
[`vogue-station-backend`](https://github.com/mjyt13/vogue-station-backend).

**Backend** (from the `vogue-station-backend` repo):

```bash
npm install
npm run db:up             # Postgres (docker compose; Steam Deck: db:up:deck)
npm run minio:up:deck     # MinIO (S3-compatible storage) — or any S3-compatible store
npm run db:migrate
npm run db:seed           # admin user + preset colors/patterns/catalog model
npm run storage:bootstrap # create the bucket, upload catalog assets
npm run start:dev         # → http://localhost:3000
```

**Frontend** (this repo):

```bash
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://localhost:3000
npm run dev            # → http://localhost:5173
```

Other scripts:

```bash
npm run build       # tsc -b + production build
npm run lint         # eslint
npm run api:types    # regenerate the typed API client from docs/openapi.json
```

Seeded dev login: `admin@vogue.dev` / `admin-password-123`.

## Running with Docker

The `Dockerfile` + `docker-compose.yml` here build this frontend into a
static bundle and serve it with nginx — they don't run the backend or its
Postgres/MinIO. Point the container at a `vogue-station-backend` you're
already running separately (its own `docker compose`, or `npm run
start:dev`):

```bash
# VITE_API_URL is baked into the JS bundle at build time (Vite inlines
# import.meta.env.VITE_*), so it must be a URL the *browser* can reach — not
# a container DNS name like http://backend:3000 — and changing it means
# rebuilding the image, not just restarting the container.
VITE_API_URL=http://localhost:3000 docker compose up -d --build
```

The container only binds `127.0.0.1:5173` — it's meant to sit behind a
reverse proxy (Caddy/nginx) on the host that terminates TLS and forwards to
it, the same way the production deployment is set up. For local testing
without a proxy in front, use `npm run dev` / `npm run preview` instead.

`docker compose up -d` (no `--build`) reuses the existing image; rebuild
whenever `VITE_API_URL` or the source changes.

### Steam Deck

SteamOS's Desktop Mode terminal (Konsole from Discover, or any other
Flatpak'd terminal) runs inside a sandbox, so `docker`/`podman` on the host
aren't directly reachable — prefix host commands with `flatpak-spawn --host`:

```bash
flatpak-spawn --host podman compose up -d --build   # or docker compose
flatpak-spawn --host podman compose down
flatpak-spawn --host podman ps                       # confirm what's running
```

This applies to any container command run from a sandboxed Deck terminal,
not just compose — e.g. `flatpak-spawn --host podman logs <container>`.

## Project structure

```
src/
  app/                 app shell — layout, header/nav
  features/
    auth/              login/register, session, route guards
    landing/           public marketing page
    create/            the editor route (composes viewer + wardrobe)
    viewer/            3D scene: model loading, transforms, UV preview
    wardrobe/          color/pattern/model catalog, pickers, upload dialogs
    cabinet/           a user's saved looks + patterns
    gallery/           public browse of approved looks
    admin/             moderation queues
  shared/              domain-agnostic primitives (Toggle, SwatchPicker,
                       Modal, the typed API client) and cross-feature UI
```
