import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, MapPin, Calendar, Clock, AlertCircle } from 'lucide-react'
import { useActivity } from '@/hooks/useActivity'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db'
import ImageCarousel from '@/components/activity/ImageCarousel'
import Chip from '@/components/ui/Chip'
import Button from '@/components/ui/Button'

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { activity, isLoading, isError } = useActivity(id)

  if (isLoading) {
    return (
      <div className="px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-8 max-w-2xl mx-auto flex flex-col gap-4">
        <div className="h-10 w-10 rounded-full bg-surface animate-pulse" />
        <div className="h-64 w-full rounded-card bg-surface animate-pulse" />
        <div className="h-8 w-2/3 bg-surface animate-pulse mt-4" />
        <div className="h-4 w-1/3 bg-surface animate-pulse" />
      </div>
    )
  }

  if (isError || !activity) {
    return (
      <div className="px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-8 max-w-2xl mx-auto text-center mt-12">
        <AlertCircle size={32} className="mx-auto text-warn mb-4" />
        <p className="text-ink">Activity not found or unable to load.</p>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">
          Go back
        </Button>
      </div>
    )
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return
    
    // Optimistically go back
    navigate('/', { replace: true })
    
    if (activity.client_id && activity.id === activity.client_id) {
      // It's a local pending entry
      await db.activities.where('client_id').equals(activity.client_id).delete()
    } else {
      // It's a synced entry
      await supabase.from('activities').delete().eq('id', activity.id)
      await db.activityCache.delete(activity.id)
    }
  }

  const categoryColor = activity.category?.color ?? '#8E8E93'

  return (
    <div className="pb-24 max-w-2xl mx-auto">
      <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-line/50">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface text-ink"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={handleDelete}
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface text-danger"
          aria-label="Delete activity"
        >
          <Trash2 size={20} />
        </button>
      </header>

      <main className="px-4 pt-4 flex flex-col gap-6">
        <ImageCarousel images={activity.images ?? []} />

        <div>
          <div className="flex items-center gap-2 mb-2">
            {activity.category && (
              <span
                className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-white uppercase tracking-wider"
                style={{ backgroundColor: categoryColor }}
              >
                {activity.category.name}
              </span>
            )}
            {activity.client_id && activity.id === activity.client_id && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-warn bg-warn/10 px-2 py-0.5 rounded-full">
                <Clock size={12} /> Pending Sync
              </span>
            )}
          </div>
          
          <h1 className="text-2xl font-semibold tracking-tight text-ink mb-3 leading-tight">
            {activity.title}
          </h1>

          <div className="flex flex-col gap-2 text-sm text-ink-muted mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="shrink-0" />
              <span>{formatDate(activity.activity_date)}</span>
            </div>
            {activity.location && (
              <div className="flex items-start gap-2">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span>{activity.location}</span>
              </div>
            )}
          </div>

          {activity.description && (
            <div className="bg-surface border border-line rounded-card p-4 shadow-sm mb-4">
              <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
                {activity.description}
              </p>
            </div>
          )}

          {activity.tags && activity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activity.tags.map((tag) => (
                <Chip key={tag}>{`#${tag}`}</Chip>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
