import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({
  children,
  className,
  hoverable = false,
  padding = 'md',
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card shadow-card',
        paddingMap[padding],
        hoverable && 'transition-shadow duration-200 hover:shadow-card-hover',
        className,
      )}
    >
      {children}
    </div>
  )
}
