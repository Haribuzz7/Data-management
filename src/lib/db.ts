import Dexie, { type EntityTable } from 'dexie'
import type { PendingActivity, Category, Activity } from '@/types'

/**
 * Local-first queue. Every new entry is written here FIRST (instant,
 * works with zero connectivity), then a background sync process
 * (see src/lib/sync.ts) pushes it to Supabase and marks it 'synced'.
 *
 * Entries stay in this table even after syncing (as a record of what
 * this device created), while `activityCache` below mirrors the full
 * server dataset for general offline browsing (Gallery/Timeline/Search).
 */
class FieldLogDB extends Dexie {
  activities!: EntityTable<PendingActivity, 'client_id'>
  categories!: EntityTable<Category, 'id'>
  activityCache!: EntityTable<Activity, 'id'>

  constructor() {
    super('field-log-db')
    this.version(1).stores({
      // client_id is the primary key locally; sync_status is indexed so
      // the sync manager can quickly query for pending work.
      activities: 'client_id, sync_status, activity_date, category_id',
      // Cached copy of the categories table, refreshed whenever online.
      // Lets New Entry's category picker work with zero connectivity.
      categories: 'id, name',
      // Mirror of the server's activities (read path), refreshed on every
      // successful fetch. Powers offline browsing of the full history,
      // not just entries created on this device.
      activityCache: 'id, activity_date, category_id, client_id',
    })
  }
}

export const db = new FieldLogDB()
