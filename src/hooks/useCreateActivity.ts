import { useMutation, useQueryClient } from '@tanstack/react-query'
import { db } from '@/lib/db'
import { syncPendingActivities } from '@/lib/sync'
import { processImage } from '@/lib/imageCompression'
import type { PendingActivity, PendingImage } from '@/types'

export interface NewActivityInput {
  title: string
  description: string
  category_id: string | null
  location: string
  activity_date: string
  tags: string[]
  photos: File[] // raw captured/picked files, not yet compressed
}

async function createActivity(input: NewActivityInput): Promise<string> {
  const clientId = crypto.randomUUID()

  // Compress every photo before it ever touches storage — keeps the
  // queue light and uploads fast once connectivity is back.
  const pendingImages: PendingImage[] = await Promise.all(
    input.photos.map(async (file, index) => {
      const { fullBlob, thumbBlob, width, height } = await processImage(file)
      return {
        local_id: crypto.randomUUID(),
        blob: fullBlob,
        thumbnail_blob: thumbBlob,
        order_index: index,
        width,
        height,
      }
    })
  )

  const record: PendingActivity = {
    client_id: clientId,
    user_id: '', // filled by sync manager from the auth session
    title: input.title,
    description: input.description || null,
    category_id: input.category_id,
    location: input.location || null,
    latitude: null,
    longitude: null,
    activity_date: input.activity_date,
    tags: input.tags,
    sync_status: 'pending',
    pending_images: pendingImages,
  }

  await db.activities.add(record)

  // Fire-and-forget: don't block the UI on network. If offline, this
  // is a no-op and the periodic/online-event sync will pick it up.
  syncPendingActivities()

  return clientId
}

export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      queryClient.invalidateQueries({ queryKey: ['activity-stats'] })
    },
  })
}
