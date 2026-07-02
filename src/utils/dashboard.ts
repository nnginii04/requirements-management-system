import type {
  AnalysisFinding,
  BuildHistory,
  Document,
  ImplementationStatus,
  LifecycleStage,
  Requirement,
} from '@/types'
import {
  getAnalysisFindingsByProjectId,
  getBuildHistoriesByProjectId,
  getCodeFileById,
  getDocumentsByProjectId,
  getRequirementsByProjectId,
  getSimilarityScoresByRequirementId,
  hasReviewIssue,
} from '@/mocks'
import {
  calculateOverallProgress,
  getImplementationStatusLabel,
  getRequirementStatusByScore,
} from '@/utils/requirement'

export interface StatusDistributionItem {
  status: ImplementationStatus
  label: string
  count: number
  color: string
}

export interface LifecycleProgressItem {
  stage: LifecycleStage
  label: string
  description: string
  progress: number
}

export interface CoverageItem {
  id: string
  title: string
  score: number
  status: ImplementationStatus
}

export interface ValidationSummary {
  requirementId: string
  title: string
  relatedCode: string[]
  similarityAvg: number
  estimatedScore: number
  status: ImplementationStatus
  validatedAt: string
}

export interface DashboardStats {
  overallProgress: number
  totalRequirements: number
  functionalCount: number
  nonFunctionalCount: number
  implementedCount: number
  inProgressCount: number
  partiallyImplementedCount: number
  notImplementedCount: number
  reviewNeededCount: number
  validatedCount: number
  documentSummary: { srs: number; prd: number; brs: number; total: number }
  latestBuild: BuildHistory | undefined
  statusDistribution: StatusDistributionItem[]
  lifecycleProgress: LifecycleProgressItem[]
  coverageList: CoverageItem[]
  aiInsights: {
    duplicate: number
    conflict: number
    missing: number
    quality: number
  }
  recentFindings: AnalysisFinding[]
  buildTimeline: { buildNumber: number; progress: number; label: string }[]
  latestValidation: ValidationSummary | null
}

const STATUS_CHART_COLORS: Record<ImplementationStatus, string> = {
  implemented: '#22C55E',
  mostly_implemented: '#0064FF',
  partially_implemented: '#F59E0B',
  not_implemented: '#9CA3AF',
  review_needed: '#EF4444',
}

function getReqImplementationStatus(req: Requirement): ImplementationStatus {
  return getRequirementStatusByScore(req.implementationScore, hasReviewIssue(req.id))
}

function countByStatus(requirements: Requirement[], status: ImplementationStatus): number {
  return requirements.filter((r) => getReqImplementationStatus(r) === status).length
}

function getDocumentSummary(documents: Document[]) {
  const countByType = (type: string) => documents.filter((d) => d.type === type).length
  return {
    srs: countByType('srs'),
    prd: countByType('prd'),
    brs: countByType('brs'),
    total: documents.length,
  }
}

function computeLifecycleProgress(requirements: Requirement[]): LifecycleProgressItem[] {
  const total = requirements.length || 1
  const approved = requirements.filter((r) => r.status === 'approved').length
  const withBaseline = requirements.filter((r) => r.baseline !== null).length
  const withSimilarity = requirements.filter(
    (r) => getSimilarityScoresByRequirementId(r.id).length > 0,
  ).length
  const overall = calculateOverallProgress(requirements)

  return [
    {
      stage: 'elicitation',
      label: '도출',
      description: '요구사항 도출',
      progress: 100,
    },
    {
      stage: 'analysis',
      label: '분석',
      description: 'AI 분석 완료',
      progress: Math.min(100, Math.round(((total - 1) / total) * 100 + 5)),
    },
    {
      stage: 'specification',
      label: '명세화',
      description: '명세화 · 베이스라인',
      progress: Math.round(((approved + withBaseline) / (total * 2)) * 100),
    },
    {
      stage: 'validation',
      label: '검증',
      description: '코드 연관도 검증',
      progress: Math.round((withSimilarity / total) * 100),
    },
    {
      stage: 'tracking',
      label: '추적',
      description: '빌드 기반 추적',
      progress: overall,
    },
  ]
}

function buildValidationSummary(requirements: Requirement[]): ValidationSummary | null {
  const ranked = [...requirements]
    .filter((r) => getSimilarityScoresByRequirementId(r.id).length > 0)
    .sort((a, b) => {
      const aScores = getSimilarityScoresByRequirementId(a.id)
      const bScores = getSimilarityScoresByRequirementId(b.id)
      const aAvg = aScores.reduce((s, x) => s + x.score, 0) / aScores.length
      const bAvg = bScores.reduce((s, x) => s + x.score, 0) / bScores.length
      return bAvg - aAvg
    })

  const top = ranked[0]
  if (!top) return null

  const scores = getSimilarityScoresByRequirementId(top.id)
  const similarityAvg = scores.reduce((s, x) => s + x.score, 0) / scores.length

  const relatedCode = scores.flatMap((s) => {
    const file = getCodeFileById(s.codeFileId)
    if (!file) return []
    return file.classes.length > 0 ? file.classes : [file.fileName.replace(/\.\w+$/, '')]
  })

  const uniqueCode = [...new Set(relatedCode)]

  return {
    requirementId: top.id,
    title: top.title,
    relatedCode: uniqueCode.slice(0, 4),
    similarityAvg: Math.round(similarityAvg * 100) / 100,
    estimatedScore: top.implementationScore,
    status: getReqImplementationStatus(top),
    validatedAt: top.updatedAt,
  }
}

export function computeDashboardStats(projectId: string): DashboardStats {
  const requirements = getRequirementsByProjectId(projectId)
  const findings = getAnalysisFindingsByProjectId(projectId)
  const builds = getBuildHistoriesByProjectId(projectId)
  const documents = getDocumentsByProjectId(projectId)

  const statusDistribution: StatusDistributionItem[] = (
    [
      'implemented',
      'mostly_implemented',
      'partially_implemented',
      'not_implemented',
      'review_needed',
    ] as ImplementationStatus[]
  ).map((status) => ({
    status,
    label: getImplementationStatusLabel(status),
    count: countByStatus(requirements, status),
    color: STATUS_CHART_COLORS[status],
  }))

  const coverageList: CoverageItem[] = [...requirements]
    .sort((a, b) => b.implementationScore - a.implementationScore)
    .map((r) => ({
      id: r.id,
      title: r.title,
      score: r.implementationScore,
      status: getReqImplementationStatus(r),
    }))

  const validatedCount = requirements.filter(
    (r) =>
      getSimilarityScoresByRequirementId(r.id).length > 0 &&
      !hasReviewIssue(r.id) &&
      r.implementationScore >= 70,
  ).length

  const buildTimeline = [...builds]
    .sort((a, b) => a.buildNumber - b.buildNumber)
    .map((b) => ({
      buildNumber: b.buildNumber,
      progress: b.requirementProgress,
      label: `#${b.buildNumber}`,
    }))

  const recentFindings = [...findings].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  return {
    overallProgress: calculateOverallProgress(requirements),
    totalRequirements: requirements.length,
    functionalCount: requirements.filter((r) => r.type === 'functional').length,
    nonFunctionalCount: requirements.filter((r) => r.type === 'non_functional').length,
    implementedCount: countByStatus(requirements, 'implemented'),
    inProgressCount: countByStatus(requirements, 'mostly_implemented'),
    partiallyImplementedCount: countByStatus(requirements, 'partially_implemented'),
    notImplementedCount: countByStatus(requirements, 'not_implemented'),
    reviewNeededCount: countByStatus(requirements, 'review_needed'),
    validatedCount,
    documentSummary: getDocumentSummary(documents),
    latestBuild: builds[0],
    statusDistribution: statusDistribution.filter((d) => d.count > 0),
    lifecycleProgress: computeLifecycleProgress(requirements),
    coverageList,
    aiInsights: {
      duplicate: findings.filter((f) => f.type === 'duplicate').length,
      conflict: findings.filter((f) => f.type === 'conflict').length,
      missing: findings.filter((f) => f.type === 'omission').length,
      quality: findings.filter((f) => ['ambiguity', 'gap'].includes(f.type)).length,
    },
    recentFindings: recentFindings.slice(0, 3),
    buildTimeline,
    latestValidation: buildValidationSummary(requirements),
  }
}
