import { useEffect, useMemo, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import {
  DashboardHero,
  DashboardKpiCards,
  DashboardStatsStrip,
  LifecycleProgressSection,
  StatusDistributionChart,
  RequirementCoverageList,
  AIInsightsCard,
  BuildTimelineChart,
  ValidationSummaryCard,
} from '@/components/dashboard'
import { useWorkflow } from '@/hooks/useWorkflow'
import { useApp } from '@/contexts/AppContext'
import { useRequirements } from '@/contexts/RequirementsContext'
import {
  fetchBuilds,
  fetchDashboardSummary,
  recomputeAnalysis,
  recomputeValidationProject,
} from '@/api/client'
import {
  computeDashboardStats,
  getDashboardBuildFallback,
  mapDashboardAggregateToStats,
  type ValidationSummary,
} from '@/utils/dashboard'
import type { BuildHistory } from '@/types'
import { loadAnalysisData } from '@/utils/analysisApi'
import {
  loadDashboardValidationSummary,
  loadValidationList,
  type ValidationListEntry,
  type ValidationListSource,
} from '@/utils/validationListApi'
import {
  loadProjectTraceabilityMatrix,
  type TraceabilitySource,
} from '@/utils/traceabilityApi'
import type { TraceabilityMatrixItem } from '@/api/types'
import type { DashboardAggregateResponse } from '@/api/types'

export function DashboardPage() {
  const workflow = useWorkflow()
  const { activeProjectId, currentProject } = useApp()
  const { requirements, apiConnected, refresh } = useRequirements()
  const projectReqs = useMemo(
    () => requirements.filter((r) => r.projectId === activeProjectId),
    [requirements, activeProjectId],
  )
  const [buildSource, setBuildSource] = useState<'api' | 'fallback_mock'>('fallback_mock')
  const [analysisData, setAnalysisData] = useState<Awaited<ReturnType<typeof loadAnalysisData>>>({
    findings: [],
    summary: {
      functionalCount: 0,
      nonFunctionalCount: 0,
      duplicateCandidates: 0,
      conflictCandidates: 0,
      missingRequirements: 0,
      traceabilityGaps: 0,
      totalFindings: 0,
    },
    source: 'fallback_mock',
  })
  const [validationList, setValidationList] = useState<ValidationListEntry[]>([])
  const [validationSource, setValidationSource] = useState<ValidationListSource>('fallback_mock')
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null)
  const [traceabilityMatrix, setTraceabilityMatrix] = useState<TraceabilityMatrixItem[]>([])
  const [traceabilitySource, setTraceabilitySource] =
    useState<TraceabilitySource>('fallback_mock')
  const [dashboardAggregate, setDashboardAggregate] = useState<DashboardAggregateResponse | null>(null)
  const [dashboardSource, setDashboardSource] = useState<'api' | 'fallback'>('fallback')
  const [recomputing, setRecomputing] = useState(false)
  const [recomputeMessage, setRecomputeMessage] = useState<string | null>(null)

  const [builds, setBuilds] = useState<BuildHistory[]>(() =>
    getDashboardBuildFallback(activeProjectId),
  )

  const reloadDashboardData = async () => {
    if (apiConnected) {
      try {
        const data = await fetchDashboardSummary(activeProjectId)
        setDashboardAggregate(data)
        setDashboardSource('api')
      } catch {
        setDashboardAggregate(null)
        setDashboardSource('fallback')
      }
    } else {
      setDashboardAggregate(null)
      setDashboardSource('fallback')
    }

    const [analysis, validationListResult, validationSummaryResult, traceabilityResult] =
      await Promise.all([
        loadAnalysisData(activeProjectId, projectReqs, apiConnected),
        loadValidationList(activeProjectId, projectReqs, apiConnected),
        loadDashboardValidationSummary(activeProjectId, projectReqs, apiConnected),
        loadProjectTraceabilityMatrix(activeProjectId, projectReqs, apiConnected),
      ])

    setAnalysisData(analysis)
    setValidationList(validationListResult.items)
    setValidationSource(validationSummaryResult.source)
    setValidationSummary(validationSummaryResult.summary)
    setTraceabilityMatrix(traceabilityResult.data)
    setTraceabilitySource(traceabilityResult.source)
  }

  useEffect(() => {
    if (!apiConnected) {
      setBuildSource('fallback_mock')
      setBuilds(getDashboardBuildFallback(activeProjectId))
      return
    }
    fetchBuilds()
      .then((data) => {
        setBuildSource('api')
        setBuilds(data.filter((b) => b.projectId === activeProjectId))
      })
      .catch(() => {
        setBuildSource('fallback_mock')
        setBuilds(getDashboardBuildFallback(activeProjectId))
      })
  }, [apiConnected, activeProjectId])

  useEffect(() => {
    let cancelled = false

    void reloadDashboardData().catch(() => {
      if (cancelled) return
    })

    return () => {
      cancelled = true
    }
  }, [activeProjectId, apiConnected, projectReqs])

  const stats = useMemo(
    () => {
      if (dashboardAggregate) {
        return mapDashboardAggregateToStats(dashboardAggregate)
      }

      return computeDashboardStats({
        requirements: projectReqs,
        builds,
        buildSource,
        analysisData,
        validationList,
        validationSummary,
        validationSummarySource: validationSource,
        traceabilityMatrix,
        traceabilitySource,
      })
    },
    [
      dashboardAggregate,
      projectReqs,
      builds,
      buildSource,
      analysisData,
      validationList,
      validationSummary,
      validationSource,
      traceabilityMatrix,
      traceabilitySource,
    ],
  )

  const handleRecompute = async () => {
    setRecomputing(true)
    setRecomputeMessage(null)
    try {
      await recomputeAnalysis(activeProjectId)
      await recomputeValidationProject(activeProjectId)
      await refresh()
      await reloadDashboardData()
      setRecomputeMessage('재분석 완료')
    } catch {
      setRecomputeMessage(apiConnected ? '재분석 API 실패 · fallback 데이터 유지' : '오프라인 · mock fallback')
    } finally {
      setRecomputing(false)
    }
  }

  return (
    <PageContainer
      title={workflow.title}
      description={workflow.subtitle}
      workflow={workflow}
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleRecompute()}
            disabled={recomputing}
            className="rounded-lg border border-border px-2 py-1 text-[10px] text-text-secondary hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {recomputing ? 'AI 분석 실행 중…' : 'AI 분석 실행'}
          </button>
          <span className="rounded-full border border-border px-2 py-1 text-[10px] text-text-secondary">
            {dashboardSource === 'api' ? 'dashboard API 기반' : 'fallback data'}
          </span>
          {recomputeMessage && (
            <span className="text-[10px] text-text-secondary">{recomputeMessage}</span>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        <DashboardHero
          projectName={currentProject.name}
          description={currentProject.description}
          overallProgress={stats.overallProgress}
          latestBuild={stats.latestBuild}
        />

        <DashboardKpiCards stats={stats} />

        <DashboardStatsStrip stats={stats} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <LifecycleProgressSection stats={stats} />
          <StatusDistributionChart stats={stats} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <RequirementCoverageList stats={stats} />
          <AIInsightsCard stats={stats} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <BuildTimelineChart stats={stats} />
          <ValidationSummaryCard
            validation={stats.latestValidation}
            dataSource={stats.dataSources.validationSummary}
          />
        </div>
      </div>
    </PageContainer>
  )
}
