import { useMemo } from 'react'
import { useActivities } from '@/hooks/useActivities'
import ActivityCard from '@/components/activity/ActivityCard'
import type { ActivityListItem } from '@/types'

function getMonthYear(dateString: string): string {
  const d = new Date(dateString + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
}

export default function Timeline() {
  const { items, isLoading } = useActivities()

  // Group items by "Month Year"
  const grouped = useMemo(() => {
    const groups: Record<string, ActivityListItem[]> = {}
    for (const item of items) {
      const key = getMonthYear(item.activity_date)
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    }
    return groups
  }, [items])

  return (
    <div className="px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
        <p className="text-sm text-ink-muted">Chronological history</p>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="h-6 w-32 bg-surface animate-pulse" />
          <div className="h-20 w-full bg-surface rounded-card animate-pulse" />
          <div className="h-20 w-full bg-surface rounded-card animate-pulse" />
        </div>
      ) : Object.keys(grouped).length > 0 ? (
        <div className="flex flex-col gap-6">
          {Object.entries(grouped).map(([monthYear, monthItems]) => (
            <section key={monthYear}>
              <h2 className="text-sm font-bold text-ink mb-3 sticky top-[calc(1rem+env(safe-area-inset-top))] bg-canvas/90 backdrop-blur-md py-1 z-10 border-b border-line/50">
                {monthYear}
              </h2>
              <div className="flex flex-col gap-2">
                {monthItems.map((item) => (
                  <ActivityCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-line rounded-card py-12 text-center mt-8">
          <p className="text-sm text-ink-faint">No activities found.</p>
        </div>
      )}
    </div>
  )
}
