import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  // Lock body scroll while open, and allow Escape to close.
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop — this is the one place glassmorphism is used, per design direction */}
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full sm:max-w-lg bg-surface rounded-t-[1.75rem] sm:rounded-[1.75rem]
                   sm:mb-8 shadow-raised max-h-[85dvh] flex flex-col
                   animate-in slide-in-from-bottom duration-250"
      >
        {/* Drag handle — visual affordance, mobile pattern */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-1.5 rounded-full bg-line" />
        </div>

        {title && (
          <div className="px-5 pb-3 pt-1 shrink-0">
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
          </div>
        )}

        <div className="overflow-y-auto px-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
