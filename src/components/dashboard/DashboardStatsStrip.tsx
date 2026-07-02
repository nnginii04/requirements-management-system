import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ProgressBar } from '@/components/ui/ProgressBar'
import type { DashboardStats } from '@/utils/dashboard'

interface DashboardStatsStripProps {
  stats: DashboardStats
}

const stripItems = (stats: DashboardStats) => [
  { label: '기능 요구사항', value: stats.functionalCount, color: 'text-primary' },
  { label: '비기능 요구사항', value: stats.nonFunctionalCount, color: 'text-secondary' },
  { label: '구현 완료', value: stats.implementedCount, color: 'text-success' },
  { label: '진행 중', value: stats.inProgressCount, color: 'text-primary' },
  { label: '일부 구현', value: stats.partiallyImplementedCount, color: 'text-warning' },
  { label: '미구현', value: stats.notImplementedCount, color: 'text-text-secondary' },
  { label: '검토 필요', value: stats.reviewNeededCount, color: 'text-danger' },
]

export function DashboardStatsStrip({ stats }: DashboardStatsStripProps) {
  return (
    <Card padding="sm" className="p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
        {stripItems(stats).map((item) => (
          <div key={item.label} className="text-center">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
            <p className="mt-1 text-[11px] text-text-secondary">{item.label}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

interface LifecycleProgressSectionProps {
  stats: DashboardStats
}

export function LifecycleProgressSection({ stats }: LifecycleProgressSectionProps) {
  return (
    <Card className="h-full">
      <SectionHeader
        title="요구사항 라이프사이클 진척"
        description="도출 → 분석 → 명세화 → 검증 → 추적"
      />
      <div className="mt-5 space-y-4">
        {stats.lifecycleProgress.map((stage) => (
          <div key={stage.stage}>
            <div className="mb-1.5 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-text-primary">{stage.label}</span>
                <span className="ml-2 text-xs text-text-secondary">{stage.description}</span>
              </div>
              <span className="text-sm font-semibold text-text-primary">~{stage.progress}%</span>
            </div>
            <ProgressBar value={stage.progress} size="sm" variant="primary" />
          </div>
        ))}
      </div>
    </Card>
  )
}
