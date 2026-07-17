import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  icon?: ReactNode
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-accent text-white active:bg-accent-pressed',
  secondary: 'bg-surface text-ink border border-line active:bg-canvas',
  ghost: 'bg-transparent text-ink active:bg-canvas',
  danger: 'bg-transparent text-danger active:bg-danger/10',
}

const SIZE_CLASSES: Record<Size, string> = {
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-14 px-6 text-base gap-2.5',
  icon: 'h-11 w-11 p-0',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      icon,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center rounded-control font-medium
          transition-colors active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none
          ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className}
        `}
        {...props}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export default Button
