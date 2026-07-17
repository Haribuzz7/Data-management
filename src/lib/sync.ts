import { supabase, STORAGE_BUCKET } from '@/lib/supabase'
import { db } from '@/lib/db'
import type { PendingActivity } from '@/types'

let syncing = false

/**
 * Pushes every 'pending' entry in the local queue to Supabase:
 * uploads its images to Storage, inserts the activity + image rows,
 * then marks the local record 'synced'. Safe to call repeatedly —
 * de-duped via the (user_id, client_id) unique index in schema.sql,
 * and guarded against overlapping runs.
 */
export async function syncPendingActivities(): Promise<void> {
  if (syncing) return
  if (!navigator.onLine) return

  syncing = true
  try {
    const pending = await db.activities.where('sync_status').equals('pending').toArray()

    for (const activity of pending) {
      try {
        await syncOne(activity)
      } catch (err) {
        console.error('Sync failed for', activity.client_id, err)
        await db.activities.update(activity.client_id, {
          sync_status: 'error',
          sync_error: err instanceof Error ? err.message : 'Unknown sync error',
        })
      }
    }
  } finally {
    syncing = false
  }
}

async function syncOne(activity: PendingActivity) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  // 1. Insert the activity row (client_id lets us safely retry without
  //    creating duplicates — see unique index in schema.sql).
  const { data: inserted, error: insertError } = await supabase
    .from('activities')
    .upsert(
      {
        user_id: user.id,
        title: activity.title,
        description: activity.description,
        category_id: activity.category_id,
        location: activity.location,
        latitude: activity.latitude,
        longitude: activity.longitude,
        activity_date: activity.activity_date,
        tags: activity.tags,
        client_id: activity.client_id,
      },
      { onConflict: 'user_id,client_id' }
    )
    .select()
    .single()

  if (insertError) throw insertError
  const activityId = inserted.id as string

  // 2. Upload each queued image to Storage, then insert its row.
  for (const img of activity.pending_images) {
    const basePath = `${user.id}/${activityId}/${img.local_id}`

    const { error: fullUploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`${basePath}.jpg`, img.blob, { contentType: 'image/jpeg', upsert: true })
    if (fullUploadError) throw fullUploadError

    const { error: thumbUploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`${basePath}_thumb.jpg`, img.thumbnail_blob, {
        contentType: 'image/jpeg',
        upsert: true,
      })
    if (thumbUploadError) throw thumbUploadError

    const { data: fullUrl } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(`${basePath}.jpg`)
    const { data: thumbUrl } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${basePath}_thumb.jpg`)

    const { error: imageInsertError } = await supabase.from('activity_images').insert({
      activity_id: activityId,
      user_id: user.id,
      storage_path: `${basePath}.jpg`,
      url: fullUrl.publicUrl,
      thumbnail_url: thumbUrl.publicUrl,
      width: img.width,
      height: img.height,
      size_bytes: img.blob.size,
      order_index: img.order_index,
    })
    if (imageInsertError) throw imageInsertError
  }

  // 3. Mark synced locally, drop the now-uploaded blobs (URLs live on
  //    the server; keeping raw blobs around wastes device storage).
  await db.activities.update(activity.client_id, {
    sync_status: 'synced',
    sync_error: undefined,
    pending_images: [],
  })
}

/** Wires up automatic sync: on load, on reconnect, and periodically. */
export function startSyncManager() {
  syncPendingActivities()

  window.addEventListener('online', syncPendingActivities)

  const interval = setInterval(syncPendingActivities, 60 * 1000)

  return () => {
    window.removeEventListener('online', syncPendingActivities)
    clearInterval(interval)
  }
}
