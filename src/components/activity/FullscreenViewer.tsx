import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  images: { id: string; url: string }[]
  initialIndex: number
  onClose: () => void
}

export default function FullscreenViewer({ images, initialIndex, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleNext = () => {
    if (currentIndex < images.length - 1) setCurrentIndex(c => c + 1)
  }

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(c => c - 1)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col touch-none">
      <header className="flex items-center justify-between p-4 pb-0 text-white">
        <span className="text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20"
        >
          <X size={20} />
        </button>
      </header>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white active:bg-black/70"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        {/* Simple implementation: just show the image. Real pinch-to-zoom is complex to do perfectly from scratch in a few lines, so we'll use a responsive image for now. */}
        <img
          key={images[currentIndex].id}
          src={images[currentIndex].url}
          alt=""
          className="max-w-full max-h-full object-contain select-none"
        />

        {currentIndex < images.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-black/50 text-white active:bg-black/70"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  )
}
