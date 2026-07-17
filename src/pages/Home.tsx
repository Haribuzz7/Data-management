import { Link } from 'react-router-dom'
import { Search, Plus, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useActivities } from '@/hooks/useActivities'
import { computeStats } from '@/utils/stats'
import ActivityCard from '@/components/activity/ActivityCard'

function todayStr() {
  return new Date().toLocaleDateString('en-CA')
}

function headerDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Home() {
  const { signOut } = useAuth()
  const { items, isLoading } = useActivities()

  const today = todayStr()
  const todayItems = items.filter((i) => i.activity_date === today)
  const recentItems = items.filter((i) => i.activity_date !== today).slice(0, 8)
  const stats = computeStats(items)

  return (
    <div className="px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-8 max-w-2xl mx-auto animate-in fade-in duration-500">
      <header className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/80 to-accent text-white flex items-center justify-center text-lg font-medium shadow-inner">
            MS
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink leading-tight">Mrs. M. Siva</h1>
            <p className="text-sm text-ink-muted">Scientist, Home science</p>
          </div>
        </div>
        <button
          onClick={signOut}
          aria-label="Sign out"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md border border-white/60 text-ink-muted shadow-sm active:scale-95 transition-transform"
        >
          <LogOut size={18} />
        </button>
      </header>

      <div className="animate-in slide-in-from-bottom duration-700 delay-150 fill-mode-both">
        <Link
          to="/search"
          className="flex items-center gap-2 bg-white/50 backdrop-blur-xl border border-white/60 rounded-pill px-4 py-3 mb-6 shadow-card hover:bg-white/60 transition-colors"
        >
          <Search size={18} className="text-ink-muted" />
          <span className="text-ink-muted text-sm font-medium">Search activities, tags…</span>
        </Link>

        <div className="grid grid-cols-4 gap-2 mb-8">
          {[
            { label: 'Today', value: stats.today },
            { label: 'This week', value: stats.thisWeek },
            { label: 'This month', value: stats.thisMonth },
            { label: 'Total', value: stats.total },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/50 backdrop-blur-xl rounded-card border border-white/60 px-2 py-3 text-center shadow-card"
            >
              <p className="text-xl font-semibold font-mono text-accent">{stat.value}</p>
              <p className="text-[11px] text-ink-muted font-medium leading-tight mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <section className="mb-8 animate-in slide-in-from-bottom duration-700 delay-300 fill-mode-both">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-ink-muted uppercase tracking-wider">
            Today's Activities
          </h2>
          <span className="text-xs font-medium text-ink-faint">{headerDate()}</span>
        </div>
        {isLoading ? (
          <SkeletonList count={2} />
        ) : todayItems.length > 0 ? (
          <div className="flex flex-col gap-2">
            {todayItems.map((item) => (
              <ActivityCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState message="Nothing logged yet today." />
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3">
          Recent Activities
        </h2>
        {isLoading ? (
          <SkeletonList count={3} />
        ) : recentItems.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentItems.map((item) => (
              <ActivityCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState message="Your recent entries will appear here." />
        )}
      </section>

      <Link
        to="/new"
        aria-label="New entry"
        className="fixed right-5 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-50
                   w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center
                   shadow-raised active:scale-95 transition-transform"
      >
        <Plus size={26} strokeWidth={2.5} />
      </Link>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-line rounded-card py-8 text-center">
      <p className="text-sm text-ink-faint">{message}</p>
    </div>
  )
}

function SkeletonList({ count }: { count: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-20 rounded-card bg-surface border border-line animate-pulse" />
      ))}
    </div>
  )
}
