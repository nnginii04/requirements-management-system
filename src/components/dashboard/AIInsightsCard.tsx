import { AlertTriangle, Copy, FileQuestion, Lightbulb } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Badge } from '@/components/ui/Badge'
import type { DashboardStats } from '@/utils/dashboard'
import { getSeverityColor } from '@/utils/colors'
import { severityLabels } from '@/utils/labels'
import { cn } from '@/utils/cn'

interface AIInsightsCardProps {
  stats: DashboardStats
}

const insightItems = (stats: DashboardStats) => [
  {
    icon: Copy,
    label: '중복 요구사항',
    count: stats.aiInsights.duplicate,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    icon: AlertTriangle,
    label: '충돌 요구사항',
    count: stats.aiInsights.conflict,
    color: 'text-danger',
    bg: 'bg-danger/10',
  },
  {
    icon: FileQuestion,
    label: '누락 요구사항',
    count: stats.aiInsights.missing,
    color: 'text-danger',
    bg: 'bg-danger/10',
  },
  {
    icon: Lightbulb,
    label: '품질 개선 항목',
    count: stats.aiInsights.quality,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
]

const findingTypeLabels: Record<string, string> = {
  duplicate: '중복',
  conflict: '충돌',
  omission: '누락',
  ambiguity: '모호',
  gap: '갭',
}

export function AIInsightsCard({ stats }: AIInsightsCardProps) {
  return (
    <Card className="h-full">
      <SectionHeader
        title="AI 인사이트"
        description="최근 AI 분석 결과 요약"
      />
      <div className="mt-4 grid grid-cols-2 gap-3">
        {insightItems(stats).map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-3"
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">{item.count}</p>
              <p className="text-[10px] text-text-secondary">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {stats.recentFindings.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
            최근 분석
          </p>
          <div className="space-y-2">
            {stats.recentFindings.map((finding) => {
              const severityColor = getSeverityColor(finding.severity)
              return (
                <div
                  key={finding.id}
                  className="rounded-lg bg-background px-3 py-2"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {findingTypeLabels[finding.type]}
                    </Badge>
                    <span
                      className={cn(
                        'text-[10px] font-medium',
                        severityColor.text,
                      )}
                    >
                      {severityLabels[finding.severity] ?? finding.severity}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-xs text-text-secondary">
                    {finding.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}
