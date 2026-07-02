import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import type { DashboardStats } from '@/utils/dashboard'
import { priorityLabels, requirementTypeLabels } from '@/utils/labels'

interface RequirementCoverageListProps {
  stats: DashboardStats
  limit?: number
}

export function RequirementCoverageList({ stats, limit = 8 }: RequirementCoverageListProps) {
  const items = stats.coverageList.slice(0, limit)

  return (
    <Card className="h-full">
      <SectionHeader
        title="요구사항 커버리지"
        description="요구사항별 추정 구현 점수"
      />
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border px-3 py-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-text-secondary">{item.id}</p>
                <p className="truncate text-sm font-medium text-text-primary">{item.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px]">
                    {item.type === 'functional'
                      ? requirementTypeLabels.functional
                      : requirementTypeLabels.non_functional}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {priorityLabels[item.priority]}
                  </Badge>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-sm font-bold text-text-primary">~{item.score}%</span>
                <StatusBadge status={item.status} />
              </div>
            </div>
            <ProgressBar value={item.score} size="sm" />
          </div>
        ))}
      </div>
    </Card>
  )
}
