import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'outline' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loadingText?: string
  icon?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50 bg-white',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100',
  ghost: 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
}

const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  icon,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) => (
  <button
    disabled={disabled || isLoading}
    className={`flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    {...rest}
  >
    {isLoading ? (
      <>
        <Loader2 size={size === 'sm' ? 13 : 16} className="animate-spin" />
        {loadingText || children}
      </>
    ) : (
      <>
        {icon}
        {children}
      </>
    )}
  </button>
)

export default Button
