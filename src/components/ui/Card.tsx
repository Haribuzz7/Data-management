import { type HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean
  pressable?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ padded = true, pressable = false, className = '', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-white/60 backdrop-blur-xl border border-white/60 rounded-card shadow-card
          ${padded ? 'p-4' : ''}
          ${pressable ? 'active:scale-[0.98] hover:bg-white/70 active:shadow-sm transition-all cursor-pointer' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'

export default Card
