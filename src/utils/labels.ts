import type {
  AnalysisFinding,
  ImplementationStatus,
  RequirementWorkflowStatus,
} from '@/types'

export const implementationStatusLabels: Record<ImplementationStatus, string> = {
  implemented: '구현 완료',
  mostly_implemented: '대부분 구현',
  partially_implemented: '일부 구현',
  not_implemented: '미구현',
  review_needed: '검토 필요',
}

export const workflowStatusLabels: Record<RequirementWorkflowStatus, string> = {
  draft: '초안',
  in_review: '검토 중',
  approved: '승인됨',
  rejected: '반려됨',
  deprecated: '폐기됨',
}

export const lifecycleStageLabels = {
  elicitation: '도출',
  analysis: '분석',
  specification: '명세화',
  validation: '검증',
  tracking: '추적',
} as const

export const findingTypeLabels: Record<AnalysisFinding['type'], string> = {
  duplicate: '중복',
  conflict: '충돌',
  omission: '누락',
  ambiguity: '품질',
  gap: '품질',
  traceability_gap: '추적성 갭',
  priority: '우선순위',
  refinement: '정제',
  test_recommendation: '테스트 필요',
  quality: '품질',
}

export const severityLabels: Record<string, string> = {
  critical: '치명',
  high: '높음',
  medium: '보통',
  low: '낮음',
}

export const buildStatusLabels: Record<string, string> = {
  success: '성공',
  failure: '실패',
  warning: '경고',
  passed: '통과',
  failed: '실패',
  partial: '부분',
  verified: '검증됨',
  linked: '연결됨',
}

export const requirementTypeLabels = {
  functional: '기능',
  non_functional: '비기능',
} as const

export const priorityLabels: Record<string, string> = {
  critical: '치명',
  high: '높음',
  medium: '보통',
  low: '낮음',
}

export const relationshipLabels: Record<string, string> = {
  implements: '구현',
  tests: '테스트',
  depends_on: '의존',
  related: '관련',
  conflicts_with: '충돌',
  duplicates: '중복',
}

export const targetTypeLabels: Record<string, string> = {
  code: '코드',
  test: '테스트',
  requirement: '요구사항',
  document: '문서',
  build: '빌드',
}

export function formatBuildStatus(status: string): string {
  return buildStatusLabels[status.toLowerCase()] ?? status
}
