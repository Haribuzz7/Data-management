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
          bg-surface border border-line rounded-card shadow-card
          ${padded ? 'p-4' : ''}
          ${pressable ? 'active:scale-[0.98] active:shadow-none transition-transform cursor-pointer' : ''}
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
