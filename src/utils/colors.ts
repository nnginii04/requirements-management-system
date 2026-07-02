import type {
  AnalysisSeverity,
  ImplementationStatus,
  RequirementPriority,
  RequirementWorkflowStatus,
} from '@/types'

export interface ColorTokens {
  bg: string
  text: string
  dot: string
  border?: string
}

export function getStatusColor(status: ImplementationStatus): ColorTokens {
  const map: Record<ImplementationStatus, ColorTokens> = {
    implemented: {
      bg: 'bg-success/10',
      text: 'text-success',
      dot: 'bg-success',
    },
    mostly_implemented: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      dot: 'bg-primary',
    },
    partially_implemented: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      dot: 'bg-warning',
    },
    not_implemented: {
      bg: 'bg-gray-100',
      text: 'text-text-secondary',
      dot: 'bg-gray-300',
    },
    review_needed: {
      bg: 'bg-danger/10',
      text: 'text-danger',
      dot: 'bg-danger',
    },
  }
  return map[status]
}

export function getWorkflowStatusColor(status: RequirementWorkflowStatus): ColorTokens {
  const map: Record<RequirementWorkflowStatus, ColorTokens> = {
    draft: { bg: 'bg-gray-100', text: 'text-text-secondary', dot: 'bg-gray-300' },
    in_review: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
    approved: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
    rejected: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
    deprecated: { bg: 'bg-gray-50', text: 'text-text-secondary', dot: 'bg-gray-400' },
  }
  return map[status]
}

export function getPriorityColor(priority: RequirementPriority): ColorTokens {
  const map: Record<RequirementPriority, ColorTokens> = {
    critical: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
    high: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
    medium: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
    low: { bg: 'bg-gray-100', text: 'text-text-secondary', dot: 'bg-gray-300' },
  }
  return map[priority]
}

export function getSeverityColor(severity: AnalysisSeverity): ColorTokens {
  const map: Record<AnalysisSeverity, ColorTokens> = {
    critical: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
    high: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
    medium: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
    low: { bg: 'bg-gray-100', text: 'text-text-secondary', dot: 'bg-gray-300' },
  }
  return map[severity]
}
