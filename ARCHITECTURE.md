# Field Activity Tracker — Architecture

## 1. Tech Stack (final)

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Fast dev/build, strong typing for a data-heavy app |
| Styling | Tailwind CSS | Rapid, consistent, easy to keep "Apple-minimal" look systematized |
| Server state | TanStack Query (React Query) | Caching, background refetch, retry — perfect for spotty rural connectivity |
| Local/offline state | Zustand + Dexie.js (IndexedDB wrapper) | Zustand for UI state, Dexie for the offline entry queue |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) | One vendor, generous free tier, RLS built in |
| Image storage | Supabase Storage | Same auth/RLS system as DB — no second API to secure. Client-side compression covers the "Cloudinary transforms" use case |
| Routing | React Router v6 | Standard, simple |
| PWA | vite-plugin-pwa (Workbox) | Installable, offline shell caching |
| Image compression | browser-image-compression | Runs before upload, keeps uploads small & fast |
| Hosting | Vercel | Free tier, zero-config for Vite |

## 2. Why Supabase Storage over Cloudinary

You asked for either — here's the reasoning:
- **One RLS system.** Storage policies use the same `auth.uid()` as the database. With Cloudinary you'd manage a second, separate access-control layer.
- **Simplicity for a project you maintain solo.** No second API key, no second dashboard, no signed-upload-URL dance.
- **Cloudinary's real advantage (server-side transforms) isn't needed** — we generate thumbnails client-side during compression, before upload.
- Trade-off: Cloudinary has a more generous free image-transform quota. If storage costs ever become a concern, migrating later is straightforward since URLs are stored in the `activity_images` table, not hardcoded.

## 3. Offline-First Strategy (core UX requirement)

This matters most for field use with poor connectivity.

**Write path:**
1. User fills "New Entry" → on Save, entry is written **immediately** to Dexie (IndexedDB) with `status: 'pending'` and a locally-generated `client_id` (uuid).
2. UI updates instantly (optimistic) — feels instant regardless of network.
3. A background sync manager (runs on network reconnect + periodic interval) pushes pending entries to Supabase using `client_id` for de-duplication (see the unique index in schema.sql).
4. Images are compressed and queued the same way — stored as Blobs in IndexedDB until upload succeeds, then the local blob is dropped once the Storage URL is confirmed.
5. Sync status shown subtly (small dot/badge on card: pending / synced / error) — never blocking.

**Read path:**
- TanStack Query caches all fetched activities. Combined with the service worker's cached app shell, the app is fully browsable offline for anything already loaded.

## 4. Folder Structure

```
src/
├── components/
│   ├── ui/                # Button, Card, Input, Chip, Sheet — reusable primitives
│   ├── activity/          # ActivityCard, ActivityForm, ImageCarousel
│   ├── layout/            # AppShell, BottomNav (mobile), TopBar
│   └── search/            # SearchBar, FilterSheet
├── pages/
│   ├── Home.tsx
│   ├── NewEntry.tsx
│   ├── Gallery.tsx
│   ├── ActivityDetail.tsx
│   ├── Search.tsx
│   ├── Timeline.tsx
│   ├── Calendar.tsx
│   └── Auth.tsx
├── hooks/
│   ├── useActivities.ts   # TanStack Query hooks
│   ├── useOfflineSync.ts
│   ├── useCamera.ts
│   └── useImageUpload.ts
├── stores/
│   └── uiStore.ts         # Zustand: modals, toasts, filter state
├── lib/
│   ├── supabase.ts        # client init
│   ├── db.ts              # Dexie schema (offline queue)
│   ├── sync.ts            # background sync manager
│   └── imageCompression.ts
├── types/
│   └── index.ts           # shared TS types (mirrors DB schema)
└── utils/
    ├── date.ts
    └── search.ts
```

## 5. Data Flow Summary

```
[Camera / Gallery picker]
        ↓
[browser-image-compression]  → full-size (compressed) + thumbnail
        ↓
[Dexie: pending queue] ──(offline)──→ shown immediately in UI (optimistic)
        ↓ (on reconnect)
[Supabase Storage upload] → [activities + activity_images tables]
        ↓
[TanStack Query cache invalidation] → UI reflects synced state
```

## 6. Design System Notes (for implementation)

- **Palette:** white/near-white backgrounds, one accent color per category (from `categories.color`), system font stack (`-apple-system`/Inter fallback).
- **Cards:** rounded-2xl, soft shadow, subtle glassmorphism (`backdrop-blur`) on overlays/sheets only — not on every card, to keep it fast on low-end Android devices.
- **Touch targets:** minimum 44×44px, generous spacing, bottom-sheet patterns for forms/filters (thumb-reachable).
- **Motion:** short (150–200ms) ease-out transitions; no heavy animation libraries needed — Tailwind + CSS transitions suffice for performance on mid-range Android phones.

## 7. Build Order (subsequent steps)

1. ✅ Database schema + architecture (this step)
2. Project scaffold: Vite + TS + Tailwind + PWA config + folder skeleton
3. Supabase client, auth flow (login screen — single user, simple)
4. Core UI primitives (Button, Card, Input, BottomSheet, Chip)
5. New Entry form + camera capture + compression
6. Offline queue (Dexie) + background sync
7. Home screen (today/recent/stats/search bar/FAB)
8. Gallery (Pinterest-style masonry)
9. Activity Detail (swipe viewer, edit, delete, download)
10. Search + Filters
11. Timeline view
12. Calendar view
13. Fullscreen image viewer (pinch-zoom)
14. Evening reminder notifications
15. PWA polish (install prompt, icons, splash) + Vercel deploy
