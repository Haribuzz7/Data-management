/**
 * Types mirror `supabase/schema.sql` exactly. If you change the schema,
 * update these too — there's no codegen wired up yet (Step: add
 * `supabase gen types typescript` once the project is linked).
 */

export type SyncStatus = 'synced' | 'pending' | 'error'

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string | null
  color: string | null
  is_default: boolean
  created_at: string
}

export interface ActivityImage {
  id: string
  activity_id: string
  user_id: string
  storage_path: string
  url: string
  thumbnail_url: string | null
  width: number | null
  height: number | null
  size_bytes: number | null
  order_index: number
  created_at: string
}

export interface Activity {
  id: string
  user_id: string
  title: string
  description: string | null
  category_id: string | null
  location: string | null
  latitude: number | null
  longitude: number | null
  activity_date: string // ISO date, e.g. "2026-07-17"
  tags: string[]
  client_id: string | null
  created_at: string
  updated_at: string

  // populated client-side via joins, not raw DB columns
  category?: Category
  images?: ActivityImage[]
}

export interface ActivityStats {
  user_id: string
  today_count: number
  this_week_count: number
  this_month_count: number
  this_year_count: number
  total_count: number
}

/**
 * Shape of an entry sitting in the offline queue (Dexie), before it has
 * been confirmed synced to Supabase. See src/lib/db.ts.
 */
export interface PendingActivity extends Omit<Activity, 'id' | 'created_at' | 'updated_at'> {
  client_id: string // required here, generated locally
  sync_status: SyncStatus
  sync_error?: string
  pending_images: PendingImage[]
}

export interface PendingImage {
  local_id: string
  blob: Blob
  thumbnail_blob: Blob
  order_index: number
  width: number
  height: number
}

/**
 * Normalized shape the UI actually renders — collapses the difference
 * between a synced server row and a not-yet-synced local queue entry so
 * ActivityCard etc. don't need to know which source it came from.
 */
export interface ActivityListItem {
  id: string // server id if synced, client_id if still local-only
  clientId: string | null
  title: string
  description: string | null
  location: string | null
  activity_date: string
  tags: string[]
  category: Category | null
  thumbnailUrl: string | null
  imageCount: number
  syncStatus: SyncStatus
}
