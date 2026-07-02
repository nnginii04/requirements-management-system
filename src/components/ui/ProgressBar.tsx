import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  variant?: 'primary' | 'success' | 'warning' | 'danger'
  className?: string
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

const variantStyles = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

function getVariantByValue(value: number): 'success' | 'warning' | 'danger' | 'primary' {
  if (value >= 80) return 'success'
  if (value >= 50) return 'primary'
  if (value >= 30) return 'warning'
  return 'danger'
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  variant,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const barVariant = variant ?? getVariantByValue(percentage)

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-text-secondary">추정 진척률</span>
          <span className="font-medium text-text-primary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full overflow-hidden rounded-full bg-gray-100', sizeStyles[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', variantStyles[barVariant])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
