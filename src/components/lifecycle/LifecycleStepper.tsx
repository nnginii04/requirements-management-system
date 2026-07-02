import type { LifecycleStage } from '@/types'
import { lifecycleSteps } from '@/mocks/data/lifecycle'
import { cn } from '@/utils/cn'
import { Check } from 'lucide-react'

interface LifecycleStepperProps {
  currentStage: LifecycleStage
  className?: string
  compact?: boolean
}

function getStageIndex(stage: LifecycleStage): number {
  return lifecycleSteps.findIndex((step) => step.id === stage)
}

export function LifecycleStepper({ currentStage, className, compact = false }: LifecycleStepperProps) {
  const currentIndex = getStageIndex(currentStage)

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card shadow-card',
        compact ? 'px-3 py-2' : 'px-6 py-4',
        className,
      )}
    >
      <div className={cn('flex items-center justify-between', compact ? 'mb-1.5' : 'mb-3')}>
        <p className="text-[10px] font-medium uppercase tracking-wider text-text-secondary">
          요구사항 엔지니어링 라이프사이클
        </p>
        <span className="text-[10px] text-text-secondary">
          {currentIndex + 1} / {lifecycleSteps.length}
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <div className="flex min-w-[520px] items-center">
        {lifecycleSteps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className={cn('flex flex-col items-center', compact ? 'gap-0.5' : 'gap-2')}>
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                    compact ? 'h-6 w-6 text-[10px]' : 'h-8 w-8',
                    isCompleted && 'border-success bg-success text-white',
                    isCurrent && 'border-primary bg-primary text-white',
                    isUpcoming && 'border-border bg-background text-text-secondary',
                  )}
                >
                  {isCompleted ? (
                    <Check className={compact ? 'h-3 w-3' : 'h-4 w-4'} strokeWidth={2.5} />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      'font-medium',
                      compact ? 'text-[10px]' : 'text-xs',
                      isCurrent && 'text-primary',
                      isCompleted && 'text-success',
                      isUpcoming && 'text-text-secondary',
                    )}
                  >
                    {step.label}
                  </p>
                  {!compact && (
                    <p className="hidden text-[10px] text-text-secondary sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {index < lifecycleSteps.length - 1 && (
                <div
                  className={cn(
                    'mx-1.5 h-0.5 flex-1',
                    compact ? 'mb-4' : 'mb-6',
                    index < currentIndex ? 'bg-success' : 'bg-border',
                  )}
                />
              )}
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}
