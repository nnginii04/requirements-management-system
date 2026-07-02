import type {
  AnalysisFinding,
  BuildHistory,
  ImplementationStatus,
  LifecycleStage,
  Requirement,
} from '@/types'
import { getBuildHistoriesByProjectId } from '@/mocks'
import type { DashboardAggregateResponse, TraceabilityMatrixItem } from '@/api/types'
import type { ValidationListEntry, ValidationListSource } from '@/utils/validationListApi'
import type { AnalysisData } from '@/utils/analysisApi'
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
  priority: Requirement['priority']
  type: Requirement['type']
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
  traceabilitySummary: {
    documents: number
    codeFiles: number
    builds: number
    tests: number
  }
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
  dataSources: {
    builds: 'api' | 'fallback_mock'
    aiInsights: 'api' | 'fallback_mock'
    validationSummary: ValidationListSource
    traceabilitySummary: 'api' | 'fallback_mock'
  }
}

export function mapDashboardAggregateToStats(
  aggregate: DashboardAggregateResponse,
): DashboardStats {
  const statusDistribution: StatusDistributionItem[] = ([
    {
      status: 'implemented' as const,
      label: getImplementationStatusLabel('implemented'),
      count: aggregate.projectSummary.implementedCount,
      color: STATUS_CHART_COLORS.implemented,
    },
    {
      status: 'mostly_implemented' as const,
      label: getImplementationStatusLabel('mostly_implemented'),
      count: aggregate.projectSummary.mostlyImplementedCount,
      color: STATUS_CHART_COLORS.mostly_implemented,
    },
    {
      status: 'partially_implemented' as const,
      label: getImplementationStatusLabel('partially_implemented'),
      count: aggregate.projectSummary.partiallyImplementedCount,
      color: STATUS_CHART_COLORS.partially_implemented,
    },
    {
      status: 'not_implemented' as const,
      label: getImplementationStatusLabel('not_implemented'),
      count: aggregate.projectSummary.notImplementedCount,
      color: STATUS_CHART_COLORS.not_implemented,
    },
    {
      status: 'review_needed' as const,
      label: getImplementationStatusLabel('review_needed'),
      count: aggregate.projectSummary.reviewNeededCount,
      color: STATUS_CHART_COLORS.review_needed,
    },
  ] satisfies StatusDistributionItem[]).filter((item) => item.count > 0)

  return {
    overallProgress: aggregate.projectSummary.overallProgress,
    totalRequirements: aggregate.projectSummary.totalRequirements,
    functionalCount: aggregate.projectSummary.functionalRequirements,
    nonFunctionalCount: aggregate.projectSummary.nonFunctionalRequirements,
    implementedCount: aggregate.projectSummary.implementedCount,
    inProgressCount: aggregate.projectSummary.mostlyImplementedCount,
    partiallyImplementedCount: aggregate.projectSummary.partiallyImplementedCount,
    notImplementedCount: aggregate.projectSummary.notImplementedCount,
    reviewNeededCount: aggregate.projectSummary.reviewNeededCount,
    validatedCount:
      aggregate.projectSummary.implementedCount +
      aggregate.projectSummary.mostlyImplementedCount,
    traceabilitySummary: {
      documents: aggregate.traceabilitySummary.linkedDocumentsCount,
      codeFiles: aggregate.traceabilitySummary.linkedCodeFilesCount,
      builds: aggregate.traceabilitySummary.linkedBuildsCount,
      tests: aggregate.traceabilitySummary.linkedTestsCount,
    },
    latestBuild:
      aggregate.projectSummary.latestBuildNumber && aggregate.projectSummary.latestBuildStatus
        ? {
            id: `build-${aggregate.projectSummary.latestBuildNumber}`,
            projectId: aggregate.projectSummary.projectId,
            buildNumber: aggregate.projectSummary.latestBuildNumber,
            status: aggregate.projectSummary.latestBuildStatus,
            branch: '',
            commitId: '',
            commitMessage: '',
            testResult: 'partial',
            testPassed: 0,
            testTotal: 0,
            requirementProgress: aggregate.projectSummary.overallProgress,
            progressChange: 0,
            changedRequirements: [],
            failedRequirements: [],
            relatedFiles: [],
            duration: '',
            createdAt: '',
          }
        : undefined,
    statusDistribution,
    lifecycleProgress: [
      {
        stage: 'elicitation',
        label: '도출',
        description: '요구사항 도출',
        progress: aggregate.projectSummary.totalRequirements > 0 ? 100 : 0,
      },
      {
        stage: 'analysis',
        label: '분석',
        description: 'AI 분석 완료',
        progress: aggregate.projectSummary.totalRequirements > 0 ? 100 : 0,
      },
      {
        stage: 'specification',
        label: '명세화',
        description: '명세화 · 베이스라인',
        progress: aggregate.projectSummary.overallProgress,
      },
      {
        stage: 'validation',
        label: '검증',
        description: '코드 연관도 검증',
        progress: aggregate.validationSummary?.estimatedImplementationScore ?? 0,
      },
      {
        stage: 'tracking',
        label: '추적',
        description: '빌드 기반 추적',
        progress: aggregate.projectSummary.overallProgress,
      },
    ],
    coverageList: aggregate.requirementCoverage.map((item) => ({
      id: item.requirementId,
      title: item.title,
      score: item.estimatedImplementationScore,
      status: item.validationStatus as ImplementationStatus,
      priority: item.priority,
      type: item.type,
    })),
    aiInsights: {
      duplicate: aggregate.aiInsights.duplicateCount,
      conflict: aggregate.aiInsights.conflictCount,
      missing: aggregate.aiInsights.missingCount,
      quality: aggregate.aiInsights.traceabilityGapCount,
    },
    recentFindings: aggregate.aiInsights.recentFindings,
    buildTimeline: aggregate.buildTimeline.map((item) => ({
      buildNumber: item.buildNumber,
      progress: item.requirementProgress,
      label: `#${item.buildNumber}`,
    })),
    latestValidation: aggregate.validationSummary
      ? {
          requirementId: aggregate.validationSummary.requirementId,
          title: aggregate.validationSummary.requirementTitle,
          relatedCode: aggregate.validationSummary.relatedCodeFiles,
          similarityAvg: aggregate.validationSummary.similarityAverage,
          estimatedScore: aggregate.validationSummary.estimatedImplementationScore,
          status: aggregate.validationSummary.validationStatus as ImplementationStatus,
          validatedAt: '',
        }
      : null,
    dataSources: {
      builds: 'api',
      aiInsights: 'api',
      validationSummary: 'api',
      traceabilitySummary: 'api',
    },
  }
}

const STATUS_CHART_COLORS: Record<ImplementationStatus, string> = {
  implemented: '#22C55E',
  mostly_implemented: '#0064FF',
  partially_implemented: '#F59E0B',
  not_implemented: '#9CA3AF',
  review_needed: '#EF4444',
}

function getReqImplementationStatus(req: Requirement): ImplementationStatus {
  return getRequirementStatusByScore(req.implementationScore, req.status === 'in_review')
}

export function getDashboardBuildFallback(projectId: string): BuildHistory[] {
  return getBuildHistoriesByProjectId(projectId)
}

function countByStatus(requirements: Requirement[], status: ImplementationStatus): number {
  return requirements.filter((r) => getReqImplementationStatus(r) === status).length
}

function computeLifecycleProgress(requirements: Requirement[]): LifecycleProgressItem[] {
  const total = requirements.length || 1
  const described = requirements.filter(
    (r) => r.description.trim().length > 0 || r.acceptanceCriteria.length > 0,
  ).length
  const approved = requirements.filter((r) => r.status === 'approved').length
  const withBaseline = requirements.filter((r) => r.baseline !== null).length
  const withImplementationSignal = requirements.filter((r) => r.implementationScore > 0).length
  const overall = calculateOverallProgress(requirements)

  return [
    {
      stage: 'elicitation',
      label: '도출',
      description: '요구사항 도출',
      progress: requirements.length > 0 ? 100 : 0,
    },
    {
      stage: 'analysis',
      label: '분석',
      description: 'AI 분석 완료',
      progress: Math.round((described / total) * 100),
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
      progress: Math.round((withImplementationSignal / total) * 100),
    },
    {
      stage: 'tracking',
      label: '추적',
      description: '빌드 기반 추적',
      progress: overall,
    },
  ]
}

function buildTraceabilitySummary(matrix: TraceabilityMatrixItem[]) {
  const documents = new Set<string>()
  const codeFiles = new Set<string>()
  const builds = new Set<string>()
  const tests = new Set<string>()

  matrix.forEach((item) => {
    item.linkedDocuments.forEach((value) => documents.add(value))
    item.linkedCodeFiles.forEach((value) => codeFiles.add(value))
    item.linkedBuilds.forEach((value) => builds.add(value))
    item.linkedTests.forEach((value) => tests.add(value))
  })

  return {
    documents: documents.size,
    codeFiles: codeFiles.size,
    builds: builds.size,
    tests: tests.size,
  }
}

export function computeDashboardStats(
  options: {
    requirements: Requirement[]
    builds: BuildHistory[]
    buildSource: 'api' | 'fallback_mock'
    analysisData: AnalysisData
    validationList: ValidationListEntry[]
    validationSummary: ValidationSummary | null
    validationSummarySource: ValidationListSource
    traceabilityMatrix: TraceabilityMatrixItem[]
    traceabilitySource: 'api' | 'fallback_mock'
  },
): DashboardStats {
  const requirements = options.requirements
  const analysisData = options.analysisData
  const validationList = options.validationList
  const builds = options.builds
  const traceabilityMatrix = options.traceabilityMatrix

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
      priority: r.priority,
      type: r.type,
    }))

  const validatedCount = requirements.filter(
    (requirement) =>
      validationList.some(
        (item) => item.requirementId === requirement.id && item.estimated >= 70,
      ) && requirement.status !== 'in_review',
  ).length

  const buildTimeline = [...builds]
    .sort((a, b) => a.buildNumber - b.buildNumber)
    .map((b) => ({
      buildNumber: b.buildNumber,
      progress: b.requirementProgress,
      label: `#${b.buildNumber}`,
    }))

  const recentFindings = [...analysisData.findings].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })

  const latestBuild = [...builds].sort((a, b) => b.buildNumber - a.buildNumber)[0]

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
    traceabilitySummary: buildTraceabilitySummary(traceabilityMatrix),
    latestBuild,
    statusDistribution: statusDistribution.filter((d) => d.count > 0),
    lifecycleProgress: computeLifecycleProgress(requirements),
    coverageList,
    aiInsights: {
      duplicate: analysisData.findings.filter((f) => f.type === 'duplicate').length,
      conflict: analysisData.findings.filter((f) => f.type === 'conflict').length,
      missing: analysisData.findings.filter((f) => f.type === 'omission').length,
      quality: analysisData.findings.filter((f) => ['ambiguity', 'gap'].includes(f.type)).length,
    },
    recentFindings: recentFindings.slice(0, 3),
    buildTimeline,
    latestValidation: options.validationSummary,
    dataSources: {
      builds: options.buildSource,
      aiInsights: analysisData.source,
      validationSummary: options.validationSummarySource,
      traceabilitySummary: options.traceabilitySource,
    },
  }
}
