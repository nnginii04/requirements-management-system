import { cn } from '@/utils/cn'

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
  sublabel?: string
}

export function ProgressRing({
  value,
  size = 160,
  strokeWidth = 12,
  className,
  label = '추정 진척률',
  sublabel,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference
  const center = size / 2

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#0064FF"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold tracking-tight text-text-primary">{value}%</span>
        <span className="mt-0.5 text-[11px] font-medium text-text-secondary">{label}</span>
        {sublabel && (
          <span className="mt-1 text-[10px] text-text-secondary">{sublabel}</span>
        )}
      </div>
    </div>
  )
}
