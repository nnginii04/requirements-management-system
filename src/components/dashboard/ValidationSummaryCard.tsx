import { GitBranch, Code2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Badge } from '@/components/ui/Badge'
import type { ValidationSummary } from '@/utils/dashboard'

interface ValidationSummaryCardProps {
  validation: ValidationSummary | null
  dataSource?: 'api' | 'fallback_mock'
}

export function ValidationSummaryCard({
  validation,
  dataSource = 'fallback_mock',
}: ValidationSummaryCardProps) {
  if (!validation) {
    return (
      <Card className="h-full">
        <div className="flex items-start justify-between gap-3">
          <SectionHeader
            title="요구사항-코드 검증 요약"
            description="가장 최근 코드 연관도 검증 결과"
          />
          <Badge variant="outline" className="shrink-0">
            {dataSource === 'fallback_mock' ? 'mock fallback' : dataSource}
          </Badge>
        </div>
        <p className="mt-6 text-sm text-text-secondary">검증 데이터가 없습니다.</p>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <SectionHeader
          title="요구사항-코드 검증 요약"
          description="가장 최근 코드 연관도 검증 결과"
        />
        <Badge variant="outline" className="shrink-0">
          <GitBranch className="mr-1 h-3 w-3" />
          {dataSource === 'fallback_mock' ? 'mock fallback' : dataSource}
        </Badge>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-background p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Code2 className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-text-secondary">{validation.requirementId}</p>
            <p className="text-base font-semibold text-text-primary">{validation.title}</p>
          </div>
          <StatusBadge status={validation.status} />
        </div>

        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium text-text-secondary">관련 코드</dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {validation.relatedCode.map((code) => (
                <span
                  key={code}
                  className="rounded-md bg-card px-2 py-1 font-mono text-xs text-text-primary ring-1 ring-border"
                >
                  {code}
                </span>
              ))}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-xs font-medium text-text-secondary">평균 유사도</dt>
              <dd className="mt-1 text-lg font-bold text-text-primary">
                ~{validation.similarityAvg}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-text-secondary">추정 구현 점수</dt>
              <dd className="mt-1 text-lg font-bold text-primary">
                ~{validation.estimatedScore}%
              </dd>
            </div>
          </div>
        </dl>

        <p className="mt-4 text-[10px] text-text-secondary">
          * 점수는 요구사항 임베딩과 코드 임베딩 유사도 기반 추정치이며, 실제 구현 완료를 보장하지 않습니다.
        </p>
      </div>
    </Card>
  )
}
