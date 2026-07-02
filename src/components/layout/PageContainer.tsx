import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import type { WorkflowConfig } from '@/config/workflow'
import { WorkflowBanner } from './WorkflowBanner'

interface PageContainerProps {
  children: ReactNode
  title?: string
  description?: string
  action?: ReactNode
  workflow?: WorkflowConfig
  showWorkflowBanner?: boolean
  className?: string
}

export function PageContainer({
  children,
  title,
  description,
  action,
  workflow,
  showWorkflowBanner = true,
  className,
}: PageContainerProps) {
  return (
    <div className={cn('flex flex-1 flex-col', className)}>
      {(title || description || action) && (
        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title && (
              <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-text-secondary">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {workflow && showWorkflowBanner && <WorkflowBanner workflow={workflow} />}

      {children}
    </div>
  )
}

export type { PageContainerProps }
