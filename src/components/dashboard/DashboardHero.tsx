import { Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { BuildHistory } from '@/types'
import { formatBuildStatus } from '@/utils/labels'

interface DashboardHeroProps {
  projectName: string
  description: string
  overallProgress: number
  latestBuild?: BuildHistory
}

export function DashboardHero({
  projectName,
  description,
  overallProgress,
  latestBuild,
}: DashboardHeroProps) {
  return (
    <Card padding="lg" className="overflow-hidden">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
            <Badge variant="primary">
              <Sparkles className="mr-1 h-3 w-3" />
              요구사항 엔지니어링 대시보드
            </Badge>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary">{projectName}</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
            {description}
          </p>
          <p className="mt-3 text-xs text-text-secondary">
            AI 기반 요구사항 분석 · 코드 임베딩 매칭 · Jenkins 빌드 추적을 통합한 구현 상태 분석 플랫폼
          </p>
          {latestBuild && (
            <div className="mt-4 flex items-center gap-3 text-xs text-text-secondary">
              <span>최신 빌드 #{latestBuild.buildNumber}</span>
              <span>·</span>
              <span className={latestBuild.status === 'success' ? 'text-success' : 'text-danger'}>
                {formatBuildStatus(latestBuild.status)}
              </span>
              <span>·</span>
              <span>{latestBuild.commitMessage}</span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2 rounded-xl border border-border bg-background px-8 py-6">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <svg className="absolute h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#0064FF"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${overallProgress * 2.64} 264`}
                className="transition-all duration-700"
              />
            </svg>
            <div className="text-center">
              <p className="text-3xl font-bold text-text-primary">~{overallProgress}%</p>
              <p className="text-[10px] font-medium text-text-secondary">추정 진척률</p>
            </div>
          </div>
          <p className="text-center text-[10px] text-text-secondary">
            전체 요구사항 평균 추정 구현 점수
          </p>
        </div>
      </div>
    </Card>
  )
}
