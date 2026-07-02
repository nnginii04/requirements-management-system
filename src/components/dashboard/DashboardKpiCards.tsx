import {
  FileText,
  CheckCircle2,
  Files,
  Hammer,
  TrendingUp,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { DashboardStats } from '@/utils/dashboard'
import { formatBuildStatus } from '@/utils/labels'

interface DashboardKpiCardsProps {
  stats: DashboardStats
}

export function DashboardKpiCards({ stats }: DashboardKpiCardsProps) {
  const { traceabilitySummary, latestBuild } = stats

  const cards = [
    {
      icon: TrendingUp,
      label: '추정 구현 점수',
      value: `~${stats.overallProgress}%`,
      sub: '전체 요구사항 평균 추정치',
      accent: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: FileText,
      label: '전체 요구사항',
      value: `${stats.totalRequirements}개`,
      sub: `기능 ${stats.functionalCount} · 비기능 ${stats.nonFunctionalCount}`,
      accent: 'text-secondary',
      bg: 'bg-secondary/10',
    },
    {
      icon: CheckCircle2,
      label: '검증된 요구사항',
      value: `${stats.validatedCount}개`,
      sub: '코드 유사도 검증 완료',
      accent: 'text-success',
      bg: 'bg-success/10',
    },
    {
      icon: Files,
      label: '추적성 링크',
      value: `${traceabilitySummary.codeFiles}개`,
      sub: `문서 ${traceabilitySummary.documents} · 빌드 ${traceabilitySummary.builds} · 테스트 ${traceabilitySummary.tests}`,
      accent: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Hammer,
      label: '최신 빌드',
      value: latestBuild ? `빌드 #${latestBuild.buildNumber}` : '—',
      sub: latestBuild
        ? `${formatBuildStatus(latestBuild.status)} · ~${latestBuild.requirementProgress}% 추정`
        : '빌드 이력 없음',
      accent: latestBuild?.status === 'success' ? 'text-success' : 'text-danger',
      bg: latestBuild?.status === 'success' ? 'bg-success/10' : 'bg-danger/10',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.label} padding="sm" className="p-4">
          <div className="flex items-start gap-3">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.accent}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-text-secondary">{card.label}</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-text-primary">{card.value}</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-text-secondary">{card.sub}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
