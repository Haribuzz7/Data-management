import { type ButtonHTMLAttributes } from 'react'
import { X } from 'lucide-react'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean
  onRemove?: () => void
  color?: string // optional hex, used for category-colored chips
}

export default function Chip({
  selected = false,
  onRemove,
  color,
  className = '',
  children,
  ...props
}: ChipProps) {
  const style = color
    ? selected
      ? { backgroundColor: color, borderColor: color, color: '#fff' }
      : { borderColor: color, color }
    : undefined

  return (
    <button
      type="button"
      className={`
        inline-flex items-center gap-1.5 h-9 px-3.5 rounded-pill border text-sm font-medium
        transition-colors active:scale-[0.97]
        ${
          !color
            ? selected
              ? 'bg-accent border-accent text-white'
              : 'bg-surface border-line text-ink-muted'
            : ''
        }
        ${className}
      `}
      style={style}
      {...props}
    >
      {children}
      {onRemove && (
        <span
          role="button"
          aria-label="Remove"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="-mr-1 p-0.5"
        >
          <X size={14} />
        </span>
      )}
    </button>
  )
}
