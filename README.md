# Field Log — ICAR Activity Tracker

A mobile-first PWA for logging field visits, inspections, meetings, and
research activities with photos — built for offline-first use in the field,
installable on Android home screen.

## Status

**Step 2 of the build (project scaffold) — complete.**
UI screens are placeholder stubs; see `ARCHITECTURE.md` in the project root
for the full build order. Routing, design system, offline DB, and Supabase
client are wired up and verified working.

## Stack

React 19 + TypeScript + Vite 8 · Tailwind CSS v4 · TanStack Query · Zustand ·
Dexie (offline queue) · Supabase (Postgres + Auth + Storage) · vite-plugin-pwa

## Setup

```bash
npm install
cp .env.example .env
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# (Supabase Dashboard → Project Settings → API)

npm run dev       # local dev server
npm run build     # production build (type-checks, then builds)
npm run preview   # preview the production build locally
```

Before running the app against a real backend, run `supabase/schema.sql`
(one level up from this folder, in the project root) in your Supabase
project's SQL Editor to create the tables, RLS policies, and storage bucket.

## Project structure

```
src/
├── components/
│   ├── ui/          # reusable primitives (Button, Card, etc. — built as needed)
│   ├── activity/     # ActivityCard, ActivityForm, ImageCarousel
│   ├── layout/        # AppShell (bottom nav + outlet)
│   └── search/
├── pages/             # one file per route
├── hooks/              # TanStack Query hooks, offline sync, camera
├── stores/             # Zustand UI state
├── lib/                # supabase client, Dexie db, sync manager
├── types/              # shared TS types (mirrors schema.sql)
└── utils/
```

## Design tokens

All colors, fonts, and radii live in `src/index.css` under `@theme` (Tailwind
v4's CSS-based config — no `tailwind.config.js`). Change a value there and
it propagates everywhere (`bg-canvas`, `text-ink-muted`, `bg-accent`, etc.).

## Icons

The icons in `public/icons/` are placeholders. Replace with real app icons
before shipping — see `vite.config.ts` for the required sizes
(192, 512, 512-maskable, apple-touch-icon).
