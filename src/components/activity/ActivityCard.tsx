import { Link } from 'react-router-dom'
import { ImageOff, Clock, AlertCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import type { ActivityListItem } from '@/types'

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ActivityCard({ item }: { item: ActivityListItem }) {
  return (
    <Link to={`/activity/${item.id}`}>
      <Card padded={false} pressable className="overflow-hidden flex gap-3 items-stretch">
        <div className="w-20 h-20 shrink-0 bg-canvas flex items-center justify-center relative">
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <ImageOff size={20} className="text-ink-faint" />
          )}
          {item.imageCount > 1 && (
            <span className="absolute bottom-1 right-1 text-[10px] font-semibold text-white bg-ink/60 rounded-pill px-1.5 py-0.5">
              +{item.imageCount - 1}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 py-2.5 pr-3 flex flex-col justify-center gap-1">
          <div className="flex items-center gap-1.5">
            {item.category && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.category.color ?? '#8E8E93' }}
              />
            )}
            <h3 className="text-sm font-semibold text-ink truncate">{item.title}</h3>
          </div>
          <p className="text-xs text-ink-muted truncate">
            {formatDate(item.activity_date)}
            {item.location ? ` · ${item.location}` : ''}
          </p>
          {item.syncStatus !== 'synced' && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-warn">
              {item.syncStatus === 'error' ? (
                <>
                  <AlertCircle size={11} /> Sync failed
                </>
              ) : (
                <>
                  <Clock size={11} /> Saved — syncing…
                </>
              )}
            </span>
          )}
        </div>
      </Card>
    </Link>
  )
}
