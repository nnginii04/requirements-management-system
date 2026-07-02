import type { ImplementationStatus } from '@/types'
import { getRequirementStatusByScore } from '@/utils/requirement'

export type ConnectionStrength = 'strong' | 'medium' | 'weak' | 'hidden'

export interface CodeMatchDetail {
  codeFileId: string
  displayName: string
  path: string
  score: number
  buildNumber: number
  commitId: string
  testCase?: string
  status: 'linked' | 'partial' | 'missing'
  reason: string
  classes: string[]
  functions: { name: string; score: number }[]
}

export interface AcceptanceCriterionStatus {
  criterion: string
  score: number
  implemented: boolean
}

export interface RequirementValidationDetail {
  requirementId: string
  matches: CodeMatchDetail[]
  missingLogic: string[]
  aiExplanation: string
  acceptanceCriteriaStatus: AcceptanceCriterionStatus[]
  buildVerification: {
    buildNumber: number
    status: 'verified' | 'partial' | 'failed'
    scoreAtBuild: number
    commitId: string
    commitMessage: string
  }
}

export function getConnectionStrength(score: number): ConnectionStrength {
  if (score < 0.4) return 'hidden'
  if (score >= 0.85) return 'strong'
  if (score >= 0.7) return 'medium'
  return 'weak'
}

export function getConnectionStrokeWidth(strength: ConnectionStrength): number {
  const map: Record<ConnectionStrength, number> = {
    strong: 3,
    medium: 2,
    weak: 1,
    hidden: 0,
  }
  return map[strength]
}

export function getConnectionColor(score: number): string {
  if (score >= 0.85) return '#22C55E'
  if (score >= 0.7) return '#0064FF'
  if (score >= 0.4) return '#F59E0B'
  return '#9CA3AF'
}

export function calculateEstimatedScore(
  matches: CodeMatchDetail[],
  acceptanceCriteria?: AcceptanceCriterionStatus[],
  topK = 5,
): number {
  const simAvg = calculateSimilarityAverage(matches, topK)
  const simScore = Math.round(simAvg * 100)

  if (acceptanceCriteria && acceptanceCriteria.length > 0) {
    const acAvg = Math.round(
      acceptanceCriteria.reduce((s, ac) => s + ac.score, 0) / acceptanceCriteria.length,
    )
    return Math.round((simScore * 0.6 + acAvg * 0.4))
  }

  return simScore
}

export function calculateSimilarityAverage(matches: CodeMatchDetail[], topK = 5): number {
  const visible = matches.filter((m) => m.score >= 0.4).sort((a, b) => b.score - a.score)
  const top = visible.slice(0, topK)
  if (top.length === 0) return 0
  return Math.round((top.reduce((s, m) => s + m.score, 0) / top.length) * 100) / 100
}

export function getValidationStatus(score: number): ImplementationStatus {
  return getRequirementStatusByScore(score, false)
}
