import { Sparkles, AlertCircle, CheckCircle2, Hammer } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { Requirement } from '@/types'
import type { RequirementValidationDetail } from '@/utils/validation'
import type { ImplementationStatus } from '@/types'
import { getImplementationStatusLabel } from '@/utils/requirement'
import { formatBuildStatus } from '@/utils/labels'

interface ValidationDetailPanelProps {
  requirement: Requirement
  detail: RequirementValidationDetail
  estimated: number
  similarityAvg: number
  status: ImplementationStatus
}

export function ValidationDetailPanel({
  requirement,
  detail,
  estimated,
  similarityAvg,
  status,
}: ValidationDetailPanelProps) {
  const buildStatusVariant =
    detail.buildVerification.status === 'verified'
      ? 'success'
      : detail.buildVerification.status === 'partial'
        ? 'warning'
        : 'danger'

  return (
    <Card padding="none" className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-secondary" />
          <h3 className="text-sm font-semibold text-text-primary">추정 구현 점수</h3>
        </div>
        <p className="mt-0.5 text-[10px] text-text-secondary">AI 기반 추정 — 확정 구현률이 아닙니다</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
          <p className="text-4xl font-bold text-primary">~{estimated}%</p>
          <p className="mt-1 text-xs text-text-secondary">추정 구현 점수</p>
          <div className="mt-3">
            <StatusBadge status={status} />
          </div>
          <p className="mt-2 text-[10px] text-text-secondary">
            {getImplementationStatusLabel(status)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatBox label="평균 유사도" value={`~${similarityAvg}`} />
          <StatBox label="매칭 파일" value={`${detail.matches.filter((m) => m.score >= 0.4).length}`} />
        </div>

        <section>
          <SectionHeader title="관련 코드" />
          <div className="mt-2 space-y-2">
            {detail.matches
              .filter((m) => m.score >= 0.4)
              .map((m) => (
                <div key={m.displayName} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <span className="font-mono text-[11px] text-text-primary">{m.displayName}</span>
                  <span className="text-sm font-bold text-primary">{(m.score * 100).toFixed(0)}%</span>
                </div>
              ))}
          </div>
        </section>

        {detail.missingLogic.length > 0 && (
          <section>
            <SectionHeader title="누락 로직" />
            <ul className="mt-2 space-y-1.5">
              {detail.missingLogic.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-danger">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <SectionHeader title="수용 기준 커버리지" />
          <div className="mt-2 space-y-2">
            {detail.acceptanceCriteriaStatus.map((ac) => (
              <div key={ac.criterion} className="rounded-lg bg-background p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-[11px] text-text-secondary">{ac.criterion}</p>
                  {ac.implemented ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                  ) : (
                    <AlertCircle className="h-3.5 w-3.5 shrink-0 text-warning" />
                  )}
                </div>
                <ProgressBar value={ac.score} size="sm" className="mt-1.5" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-background p-4">
          <SectionHeader title="AI 설명" />
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">{detail.aiExplanation}</p>
        </section>

        <section>
          <SectionHeader title="빌드 기준 검증 결과" />
          <div className="mt-2 rounded-lg border border-border p-3">
            <div className="flex items-center gap-2">
              <Hammer className="h-4 w-4 text-text-secondary" />
              <span className="font-mono text-sm font-semibold">
                빌드 #{detail.buildVerification.buildNumber}
              </span>
              <Badge variant={buildStatusVariant}>
                {formatBuildStatus(detail.buildVerification.status)}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              빌드 시점 점수: ~{detail.buildVerification.scoreAtBuild}%
            </p>
            <p className="mt-1 font-mono text-[10px] text-text-secondary">
              {detail.buildVerification.commitId} — {detail.buildVerification.commitMessage}
            </p>
          </div>
        </section>

        <div className="rounded-lg bg-gray-50 p-3 text-[10px] leading-relaxed text-text-secondary">
          <strong>계산 방식 (추정):</strong> Top-K 코드 유사도 평균 × 100, 수용 기준별 구현률 평균과
          결합. 코사인 유사도 ≥ 0.85 → 강한 연결.
        </div>
      </div>
    </Card>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3 text-center">
      <p className="text-lg font-bold text-text-primary">{value}</p>
      <p className="text-[10px] text-text-secondary">{label}</p>
    </div>
  )
}
