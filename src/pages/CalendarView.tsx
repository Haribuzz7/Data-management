import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useActivities } from '@/hooks/useActivities'
import ActivityCard from '@/components/activity/ActivityCard'
import clsx from 'clsx'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function toISODate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function CalendarView() {
  const { items, isLoading } = useActivities()
  
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(today.getFullYear(), today.getMonth(), today.getDate()))

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  // Map of date (YYYY-MM-DD) -> has items
  const activityDates = useMemo(() => {
    const map = new Set<string>()
    for (const item of items) {
      map.add(item.activity_date)
    }
    return map
  }, [items])

  const selectedItems = useMemo(() => {
    return items.filter(i => i.activity_date === selectedDate)
  }, [items, selectedDate])

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  return (
    <div className="px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-sm text-ink-muted">View activities by date</p>
      </header>

      <div className="bg-surface border border-line rounded-card p-4 shadow-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-1 active:bg-canvas rounded-full">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-semibold text-ink">
            {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={handleNextMonth} className="p-1 active:bg-canvas rounded-full">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-[10px] font-semibold text-ink-muted uppercase">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="aspect-square" />
          ))}
          {days.map((day) => {
            const dateStr = toISODate(year, month, day)
            const isSelected = dateStr === selectedDate
            const hasActivity = activityDates.has(dateStr)
            const isToday = dateStr === toISODate(today.getFullYear(), today.getMonth(), today.getDate())

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={clsx(
                  "aspect-square rounded-full flex flex-col items-center justify-center relative text-sm active:scale-95 transition-transform",
                  isSelected ? "bg-accent text-white font-semibold shadow-sm" : "text-ink hover:bg-canvas",
                  isToday && !isSelected && "ring-1 ring-inset ring-accent/30 font-semibold text-accent"
                )}
              >
                <span>{day}</span>
                {hasActivity && (
                  <span className={clsx(
                    "absolute bottom-1 w-1 h-1 rounded-full",
                    isSelected ? "bg-white" : "bg-accent"
                  )} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-ink-muted uppercase tracking-wide mb-3 flex items-center justify-between">
          <span>{new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          <span className="text-xs bg-surface border border-line px-2 py-0.5 rounded-full">{selectedItems.length}</span>
        </h3>
        
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <div className="h-20 w-full bg-surface rounded-card animate-pulse" />
          </div>
        ) : selectedItems.length > 0 ? (
          <div className="flex flex-col gap-2">
            {selectedItems.map((item) => (
              <ActivityCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-line rounded-card py-8 text-center">
            <p className="text-sm text-ink-faint">No activities on this date.</p>
          </div>
        )}
      </section>
    </div>
  )
}
