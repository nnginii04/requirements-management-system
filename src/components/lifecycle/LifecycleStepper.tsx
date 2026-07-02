import type { LifecycleStage } from '@/types'
import { lifecycleSteps } from '@/mocks/data/lifecycle'
import { cn } from '@/utils/cn'
import { Check } from 'lucide-react'

interface LifecycleStepperProps {
  currentStage: LifecycleStage
  className?: string
}

function getStageIndex(stage: LifecycleStage): number {
  return lifecycleSteps.findIndex((step) => step.id === stage)
}

export function LifecycleStepper({ currentStage, className }: LifecycleStepperProps) {
  const currentIndex = getStageIndex(currentStage)

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card px-6 py-4 shadow-card',
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
          요구사항 엔지니어링 라이프사이클
        </p>
        <span className="text-xs text-text-secondary">
          {currentIndex + 1} / {lifecycleSteps.length} 단계
        </span>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <div className="flex min-w-[600px] items-center">
        {lifecycleSteps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <div key={step.id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                    isCompleted && 'border-success bg-success text-white',
                    isCurrent && 'border-primary bg-primary text-white',
                    isUpcoming && 'border-border bg-background text-text-secondary',
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      'text-xs font-medium',
                      isCurrent && 'text-primary',
                      isCompleted && 'text-success',
                      isUpcoming && 'text-text-secondary',
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="hidden text-[10px] text-text-secondary sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < lifecycleSteps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 mb-6 h-0.5 flex-1',
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
