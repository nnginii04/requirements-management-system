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
import { getBuildHistoriesByProjectId } from '@/mocks'
import { fetchBuilds } from '@/api/client'
import { computeDashboardStats } from '@/utils/dashboard'
import type { BuildHistory } from '@/types'

export function DashboardPage() {
  const workflow = useWorkflow()
  const { activeProjectId, currentProject } = useApp()
  const { requirements, apiConnected } = useRequirements()
  const projectReqs = requirements.filter((r) => r.projectId === activeProjectId)

  const [builds, setBuilds] = useState<BuildHistory[]>(() =>
    getBuildHistoriesByProjectId(activeProjectId),
  )

  useEffect(() => {
    if (!apiConnected) {
      setBuilds(getBuildHistoriesByProjectId(activeProjectId))
      return
    }
    fetchBuilds()
      .then((data) =>
        setBuilds(data.filter((b) => b.projectId === activeProjectId)),
      )
      .catch(() => setBuilds(getBuildHistoriesByProjectId(activeProjectId)))
  }, [apiConnected, requirements, activeProjectId])

  const stats = useMemo(
    () =>
      computeDashboardStats(activeProjectId, {
        requirements: projectReqs,
        builds,
      }),
    [activeProjectId, projectReqs, builds],
  )

  return (
    <PageContainer
      title={workflow.title}
      description={workflow.subtitle}
      workflow={workflow}
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
          <ValidationSummaryCard validation={stats.latestValidation} />
        </div>
      </div>
    </PageContainer>
  )
}
