import { Loader2 } from 'lucide-react'

type SpinnerProps = {
  size?: number
  fullHeight?: boolean
  className?: string
}

const Spinner = ({
  size = 24,
  fullHeight = true,
  className = '',
}: SpinnerProps) => (
  <div
    className={`flex items-center justify-center ${fullHeight ? 'h-40' : ''}`}
  >
    <Loader2
      size={size}
      className={`animate-spin text-blue-600 ${className}`}
    />
  </div>
)

export default Spinner
