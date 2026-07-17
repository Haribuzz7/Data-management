import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { useActivities } from '@/hooks/useActivities'
import ActivityCard from '@/components/activity/ActivityCard'
import FilterSheet, { type FilterOptions } from '@/components/search/FilterSheet'

export default function Search() {
  const navigate = useNavigate()
  const { items, isLoading } = useActivities()
  
  const [query, setQuery] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    categoryId: null,
    timeframe: 'all'
  })

  const filteredItems = useMemo(() => {
    let result = items

    // Apply category filter
    if (filters.categoryId) {
      result = result.filter(i => i.category?.id === filters.categoryId)
    }

    // Apply timeframe filter
    if (filters.timeframe !== 'all') {
      const now = new Date()
      let cutoffDate = new Date(0)
      
      if (filters.timeframe === 'this_week') {
        cutoffDate = new Date(now.setDate(now.getDate() - now.getDay()))
      } else if (filters.timeframe === 'this_month') {
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1)
      } else if (filters.timeframe === 'this_year') {
        cutoffDate = new Date(now.getFullYear(), 0, 1)
      }
      
      result = result.filter(i => new Date(i.activity_date) >= cutoffDate)
    }

    // Apply text search
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(i => 
        i.title.toLowerCase().includes(q) ||
        (i.description?.toLowerCase().includes(q)) ||
        (i.location?.toLowerCase().includes(q)) ||
        i.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    return result
  }, [items, query, filters])

  return (
    <div className="bg-canvas min-h-dvh">
      <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-line/50">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full active:bg-surface text-ink"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 relative flex items-center">
          <SearchIcon size={18} className="absolute left-3 text-ink-faint" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activities..."
            className="w-full bg-surface border-none rounded-pill pl-10 pr-4 py-2.5 text-sm text-ink outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>
        <button
          onClick={() => setIsFilterOpen(true)}
          className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full active:bg-surface text-ink relative"
        >
          <SlidersHorizontal size={20} />
          {(filters.categoryId || filters.timeframe !== 'all') && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
          )}
        </button>
      </header>

      <main className="px-4 py-6 max-w-2xl mx-auto pb-24">
        {isLoading ? (
          <div className="flex flex-col gap-2">
             {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-card bg-surface animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
              {filteredItems.length} Result{filteredItems.length !== 1 ? 's' : ''}
            </h2>
            {filteredItems.map(item => (
              <ActivityCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center mt-12 text-ink-faint">
            <SearchIcon size={32} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">No activities match your search.</p>
          </div>
        )}
      </main>

      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        currentFilters={filters}
        onApply={setFilters}
      />
    </div>
  )
}
