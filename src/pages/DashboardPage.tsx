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
import { currentProject, currentProjectId } from '@/mocks'
import { computeDashboardStats } from '@/utils/dashboard'

export function DashboardPage() {
  const workflow = useWorkflow()
  const stats = computeDashboardStats(currentProjectId)

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
