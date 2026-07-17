import { useActivities } from '@/hooks/useActivities'
import GalleryItem from '@/components/activity/GalleryItem'

export default function Gallery() {
  const { items, isLoading } = useActivities()
  
  // Filter items that have at least one image
  const galleryItems = items.filter(item => item.imageCount > 0)

  return (
    <div className="px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] max-w-2xl mx-auto">
      <header className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Gallery</h1>
        <p className="text-sm text-ink-muted">All your photos from the field</p>
      </header>

      {isLoading ? (
        <div className="columns-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="mb-4 bg-surface rounded-card aspect-[4/3] animate-pulse" />
          ))}
        </div>
      ) : galleryItems.length > 0 ? (
        <div className="columns-2 gap-4">
          {galleryItems.map((item) => (
            <GalleryItem key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-line rounded-card py-12 text-center mt-8">
          <p className="text-sm text-ink-faint">No photos yet.</p>
        </div>
      )}
    </div>
  )
}
