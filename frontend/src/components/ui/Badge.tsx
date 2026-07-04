type BadgeVariant =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'active'
  | 'inactive'
  | 'approved'
  | 'rejected'

const variantStyles: Record<BadgeVariant, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-blue-50 text-blue-700',
  active: 'bg-green-50 text-green-700',
  inactive: 'bg-zinc-100 text-zinc-500',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}

type BadgeProps = {
  variant: BadgeVariant
  children: React.ReactNode
}

const Badge = ({ variant, children }: BadgeProps) => (
  <span
    className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${variantStyles[variant]}`}
  >
    {children}
  </span>
)

export default Badge
