import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ImageOff } from 'lucide-react'
import FullscreenViewer from './FullscreenViewer'

interface Props {
  images: { id: string; url: string; thumbnail_url?: string | null }[]
}

export default function ImageCarousel({ images }: Props) {
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null)

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-surface border border-line rounded-card flex flex-col items-center justify-center gap-2 text-ink-faint">
        <ImageOff size={32} />
        <span className="text-sm">No photos</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-3 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setFullscreenIndex(i)}
            className="w-[85%] sm:w-full shrink-0 snap-center aspect-[4/3] relative rounded-card overflow-hidden bg-canvas active:scale-[0.98] transition-transform"
          >
            <img
              src={img.url}
              alt=""
              className="w-full h-full object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          </button>
        ))}
      </div>

      {fullscreenIndex !== null &&
        createPortal(
          <FullscreenViewer
            images={images}
            initialIndex={fullscreenIndex}
            onClose={() => setFullscreenIndex(null)}
          />,
          document.body
        )}
    </>
  )
}
