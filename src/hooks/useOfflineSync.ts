import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { startSyncManager, syncPendingActivities } from '@/lib/sync'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const stop = startSyncManager()
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      stop()
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  const pendingCount =
    useLiveQuery(() => db.activities.where('sync_status').equals('pending').count(), []) ?? 0

  const errorCount =
    useLiveQuery(() => db.activities.where('sync_status').equals('error').count(), []) ?? 0

  return { isOnline, pendingCount, errorCount, syncNow: syncPendingActivities }
}
