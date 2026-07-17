import { Link } from 'react-router-dom'
import { ImageOff, Clock, AlertCircle } from 'lucide-react'
import type { ActivityListItem } from '@/types'

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function GalleryItem({ item }: { item: ActivityListItem }) {
  return (
    <Link to={`/activity/${item.id}`} className="block mb-4 break-inside-avoid">
      <div className="bg-surface rounded-card border border-line overflow-hidden shadow-card active:scale-[0.98] transition-transform">
        <div className="relative bg-canvas flex items-center justify-center aspect-[4/3]">
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <ImageOff size={24} className="text-ink-faint" />
          )}
          {item.imageCount > 1 && (
            <span className="absolute top-2 right-2 text-[10px] font-semibold text-white bg-ink/60 rounded-pill px-1.5 py-0.5 backdrop-blur-sm">
              +{item.imageCount - 1}
            </span>
          )}
        </div>

        <div className="p-2.5 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            {item.category && (
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.category.color ?? '#8E8E93' }}
              />
            )}
            <h3 className="text-[13px] font-semibold text-ink leading-tight line-clamp-2">{item.title}</h3>
          </div>
          <p className="text-[11px] text-ink-muted truncate">
            {formatDate(item.activity_date)}
          </p>
          {item.syncStatus !== 'synced' && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-warn mt-0.5">
              {item.syncStatus === 'error' ? (
                <>
                  <AlertCircle size={10} /> Sync failed
                </>
              ) : (
                <>
                  <Clock size={10} /> Syncing…
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
