import type { AnalysisFinding, Requirement } from '@/types'
import { analysisFindings } from '@/mocks/data/analysisFindings'
import { findingTypeLabels } from '@/utils/labels'

export interface AnalysisSummary {
  functionalCount: number
  nonFunctionalCount: number
  duplicateCandidates: number
  conflictCandidates: number
  missingRequirements: number
  traceabilityGaps: number
  totalFindings: number
}

export function computeAnalysisSummary(requirements: Requirement[]): AnalysisSummary {
  const findings = analysisFindings

  return {
    functionalCount: requirements.filter((r) => r.type === 'functional').length,
    nonFunctionalCount: requirements.filter((r) => r.type === 'non_functional').length,
    duplicateCandidates: findings.filter((f) => f.type === 'duplicate').length,
    conflictCandidates: findings.filter((f) => f.type === 'conflict').length,
    missingRequirements: findings.filter((f) => f.type === 'omission').length,
    traceabilityGaps: findings.filter((f) => f.type === 'traceability_gap').length,
    totalFindings: findings.length,
  }
}

export function getFindingTypeLabel(type: AnalysisFinding['type']): string {
  return findingTypeLabels[type]
}

export function getActionLabel(action: string): string {
  if (action.includes('병합') || action.includes('Merge')) return '요구사항 병합'
  if (action.includes('폐기') || action.includes('Review')) return '정책 검토'
  if (action.includes('편입') || action.includes('Add')) return '요구사항 추가'
  if (action.includes('테스트') || action.includes('Test')) return '테스트 케이스 추가'
  if (action.includes('추적') || action.includes('Trace')) return '추적성 보완'
  if (action.includes('명시') || action.includes('Refine')) return '문구 정제'
  return '검토'
}

export function getAllFindings(): AnalysisFinding[] {
  return analysisFindings
}
