import type { ImplementationStatus, Requirement } from '@/types'
import { implementationStatusLabels } from '@/utils/labels'

export function getRequirementStatusByScore(
  score: number,
  hasReviewIssue = false,
): ImplementationStatus {
  if (hasReviewIssue) return 'review_needed'
  if (score >= 90) return 'implemented'
  if (score >= 70) return 'mostly_implemented'
  if (score >= 40) return 'partially_implemented'
  return 'not_implemented'
}

export function calculateOverallProgress(requirements: Requirement[]): number {
  if (requirements.length === 0) return 0
  const total = requirements.reduce((sum, req) => sum + req.implementationScore, 0)
  return Math.round(total / requirements.length)
}

export function calculateProgressChange(current: number, previous: number): number {
  return Math.round((current - previous) * 10) / 10
}

export function getImplementationStatusLabel(status: ImplementationStatus): string {
  return implementationStatusLabels[status]
}
