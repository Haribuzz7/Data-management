import { useState, useEffect } from 'react'
import BottomSheet from '@/components/ui/BottomSheet'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import { useCategories } from '@/hooks/useCategories'

export interface FilterOptions {
  categoryId: string | null
  timeframe: 'all' | 'this_week' | 'this_month' | 'this_year'
}

interface Props {
  isOpen: boolean
  onClose: () => void
  currentFilters: FilterOptions
  onApply: (filters: FilterOptions) => void
}

export default function FilterSheet({ isOpen, onClose, currentFilters, onApply }: Props) {
  const { data: categories = [] } = useCategories()
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters)

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(currentFilters)
    }
  }, [isOpen, currentFilters])

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleClear = () => {
    setLocalFilters({ categoryId: null, timeframe: 'all' })
  }

  return (
    <BottomSheet open={isOpen} onClose={onClose} title="Filters">
      <div className="flex flex-col gap-6">
        <section>
          <h3 className="text-sm font-semibold text-ink mb-3">Timeframe</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All time' },
              { id: 'this_week', label: 'This week' },
              { id: 'this_month', label: 'This month' },
              { id: 'this_year', label: 'This year' },
            ].map((tf) => (
              <Chip
                key={tf.id}
                selected={localFilters.timeframe === tf.id}
                onClick={() => setLocalFilters({ ...localFilters, timeframe: tf.id as FilterOptions['timeframe'] })}
              >
                {tf.label}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-ink mb-3">Category</h3>
          <div className="flex flex-wrap gap-2">
            <Chip
              selected={localFilters.categoryId === null}
              onClick={() => setLocalFilters({ ...localFilters, categoryId: null })}
            >
              All categories
            </Chip>
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                selected={localFilters.categoryId === cat.id}
                onClick={() => setLocalFilters({ ...localFilters, categoryId: cat.id })}
                style={localFilters.categoryId === cat.id ? { backgroundColor: cat.color ?? undefined, color: 'white' } : undefined}
              >
                {cat.name}
              </Chip>
            ))}
          </div>
        </section>

        <div className="mt-4 flex gap-3">
          <Button variant="secondary" fullWidth onClick={handleClear}>
            Clear
          </Button>
          <Button fullWidth onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
