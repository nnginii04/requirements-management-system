import { type ReactNode } from 'react'
import { Hammer, CheckCircle2, Gauge, Clock } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'
import type { BuildSummary } from '@/utils/buildHistory'
import { BuildStatusLabel } from './buildStatus'

interface BuildSummaryCardsProps {
  summary: BuildSummary
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** 헤드라인 숫자는 차트가 아니라 stat tile 로 — 값 하나에 축을 붙이지 않습니다. */
function StatTile({
  icon: Icon,
  label,
  value,
  unit,
  footer,
  valueClassName,
}: {
  icon: typeof Hammer
  label: string
  value: string
  unit?: string
  footer?: ReactNode
  valueClassName?: string
}) {
  return (
    <Card padding="sm" className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
        </span>
        <span className="truncate text-xs font-medium text-text-secondary">{label}</span>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className={cn('text-2xl font-semibold tracking-tight text-text-primary', valueClassName)}>
          {value}
        </span>
        {unit && <span className="text-sm text-text-secondary">{unit}</span>}
      </div>
      <div className="mt-2 min-h-[18px]">{footer}</div>
    </Card>
  )
}

export function BuildSummaryCards({ summary }: BuildSummaryCardsProps) {
  const { latestBuild, successRate, averageProgress, lastUpdated, totalBuilds } = summary

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4')}>
      <StatTile
        icon={Hammer}
        label="최신 빌드"
        value={`#${latestBuild.buildNumber}`}
        footer={<BuildStatusLabel status={latestBuild.status} />}
      />
      <StatTile
        icon={CheckCircle2}
        label="빌드 성공률"
        value={String(successRate)}
        unit="%"
        footer={
          <span className="text-[11px] text-text-secondary">전체 {totalBuilds}회 빌드 기준</span>
        }
      />
      <StatTile
        icon={Gauge}
        label="평균 추정 진척률"
        value={String(averageProgress)}
        unit="%"
        footer={
          <span className="text-[11px] text-text-secondary">
            최신 빌드 ~{latestBuild.requirementProgress}%
          </span>
        }
      />
      <StatTile
        icon={Clock}
        label="마지막 갱신"
        value={formatDateTime(lastUpdated)}
        valueClassName="text-base"
        footer={
          <span className="text-[11px] text-text-secondary">
            소요 {latestBuild.duration} · {latestBuild.branch}
          </span>
        }
      />
    </div>
  )
}
