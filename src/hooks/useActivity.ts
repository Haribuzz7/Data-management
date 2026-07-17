import { useQuery } from '@tanstack/react-query'
import { useLiveQuery } from 'dexie-react-hooks'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db'
import type { Activity } from '@/types'

export function useActivity(id: string | undefined) {
  // First, check local offline queue (if it's a client_id and hasn't synced yet)
  const pendingActivity = useLiveQuery(
    async () => {
      if (!id) return null
      return await db.activities.where('client_id').equals(id).first()
    },
    [id]
  )

  const serverQuery = useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      if (!id) return null
      // Check cache first for instant load
      const cached = await db.activityCache.get(id)
      
      const { data, error } = await supabase
        .from('activities')
        .select('*, category:categories(*), images:activity_images(*)')
        .eq('id', id)
        .single()

      if (error) {
        if (cached) return cached
        throw error
      }
      
      // Ensure images are sorted by order_index
      if (data && data.images) {
        data.images.sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
      }

      await db.activityCache.put(data as Activity)
      return data as Activity
    },
    enabled: !!id && !pendingActivity, // Only fetch from server if it's not pending locally
    staleTime: 60 * 1000,
  })

  // Format pending activity to match server Activity shape for UI
  const localFormatted = pendingActivity
    ? ({
        id: pendingActivity.client_id,
        client_id: pendingActivity.client_id,
        user_id: '',
        title: pendingActivity.title,
        description: pendingActivity.description,
        location: pendingActivity.location,
        latitude: pendingActivity.latitude,
        longitude: pendingActivity.longitude,
        activity_date: pendingActivity.activity_date,
        tags: pendingActivity.tags,
        category_id: pendingActivity.category_id,
        category: undefined, // Could look up from useCategories if needed, but detail view might not strictly need full category object or we just show name.
        images: pendingActivity.pending_images.map(img => ({
          id: img.local_id,
          url: URL.createObjectURL(img.blob),
          thumbnail_url: URL.createObjectURL(img.thumbnail_blob),
          order_index: img.order_index,
          // fake other fields
          activity_id: pendingActivity.client_id,
          user_id: '',
          storage_path: '',
          width: img.width,
          height: img.height,
          size_bytes: img.blob.size,
          created_at: new Date().toISOString()
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Activity)
    : null

  return {
    activity: localFormatted ?? serverQuery.data,
    isLoading: !pendingActivity && serverQuery.isLoading,
    isError: serverQuery.isError,
  }
}
