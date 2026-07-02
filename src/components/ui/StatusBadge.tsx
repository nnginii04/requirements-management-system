import type { ImplementationStatus, RequirementWorkflowStatus } from '@/types'
import { getStatusColor, getWorkflowStatusColor } from '@/utils/colors'
import { getImplementationStatusLabel } from '@/utils/requirement'
import { cn } from '@/utils/cn'

interface StatusBadgeProps {
  status: ImplementationStatus
  className?: string
}

import { workflowStatusLabels } from '@/utils/labels'
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getStatusColor(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        config.bg,
        config.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {getImplementationStatusLabel(status)}
    </span>
  )
}

interface WorkflowStatusBadgeProps {
  status: RequirementWorkflowStatus
  className?: string
}

export function WorkflowStatusBadge({ status, className }: WorkflowStatusBadgeProps) {
  const config = getWorkflowStatusColor(status)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        config.bg,
        config.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {workflowStatusLabels[status]}
    </span>
  )
}
