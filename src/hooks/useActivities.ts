import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLiveQuery } from 'dexie-react-hooks'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db'
import type { Activity, ActivityListItem, PendingActivity } from '@/types'

async function fetchServerActivities(): Promise<Activity[]> {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*, category:categories(*), images:activity_images(*)')
      .order('activity_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error

    await db.activityCache.bulkPut(data as Activity[])
    return data as Activity[]
  } catch {
    // Offline, or Supabase unreachable — serve the last cached snapshot.
    const cached = await db.activityCache.orderBy('activity_date').reverse().toArray()
    return cached
  }
}

function serverToListItem(a: Activity): ActivityListItem {
  const images = a.images ?? []
  const cover = [...images].sort((x, y) => x.order_index - y.order_index)[0]
  return {
    id: a.id,
    clientId: a.client_id,
    title: a.title,
    description: a.description,
    location: a.location,
    activity_date: a.activity_date,
    tags: a.tags,
    category: a.category ?? null,
    thumbnailUrl: cover?.thumbnail_url ?? cover?.url ?? null,
    imageCount: images.length,
    syncStatus: 'synced',
  }
}

/**
 * Not-yet-synced local entries don't have a server thumbnail URL yet —
 * this hook creates temporary blob: URLs for their first image and
 * cleans them up when the underlying data changes/unmounts.
 */
function usePendingListItems(pending: PendingActivity[]): ActivityListItem[] {
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    const urls: Record<string, string> = {}
    for (const p of pending) {
      const first = [...p.pending_images].sort((x, y) => x.order_index - y.order_index)[0]
      if (first) urls[p.client_id] = URL.createObjectURL(first.thumbnail_blob)
    }
    setThumbUrls(urls)
    return () => {
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending.map((p) => p.client_id + p.pending_images.length).join(',')])

  return pending.map((p) => ({
    id: p.client_id,
    clientId: p.client_id,
    title: p.title,
    description: p.description,
    location: p.location,
    activity_date: p.activity_date,
    tags: p.tags,
    category: null, // resolved client-side by consumers via categoryId if needed
    thumbnailUrl: thumbUrls[p.client_id] ?? null,
    imageCount: p.pending_images.length,
    syncStatus: p.sync_status,
  }))
}

export function useActivities() {
  const serverQuery = useQuery({
    queryKey: ['activities'],
    queryFn: fetchServerActivities,
    staleTime: 30 * 1000,
  })

  // Local entries not yet confirmed synced — shown immediately so "add
  // within a minute" actually feels instant, even with zero signal.
  const localPending =
    useLiveQuery(
      () => db.activities.where('sync_status').anyOf('pending', 'error').toArray(),
      []
    ) ?? []

  const pendingItems = usePendingListItems(localPending)

  const items = useMemo(() => {
    const serverItems = (serverQuery.data ?? []).map(serverToListItem)
    // A local entry disappears from this list the moment its sync_status
    // flips to 'synced' (useLiveQuery re-runs), at which point the server
    // copy — fetched on the next query invalidation — takes over.
    return [...pendingItems, ...serverItems]
  }, [pendingItems, serverQuery.data])

  return {
    items,
    isLoading: serverQuery.isLoading,
    isError: serverQuery.isError,
    refetch: serverQuery.refetch,
  }
}
