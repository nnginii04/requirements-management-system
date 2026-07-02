import { AlertTriangle, Code2, Link2, Sparkles } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { Requirement, RequirementVersion } from '@/types'
import {
  getAnalysisFindingsByRequirementId,
  getSimilarityScoresByRequirementId,
  getCodeFileById,
  hasReviewIssue,
} from '@/mocks'
import { getRequirementStatusByScore } from '@/utils/requirement'
import { getSeverityColor } from '@/utils/colors'
import { severityLabels, relationshipLabels, targetTypeLabels } from '@/utils/labels'
import { cn } from '@/utils/cn'

interface RequirementAnalysisPanelProps {
  requirement: Requirement | null
  versions: RequirementVersion[]
}

const findingLabels: Record<string, string> = {
  duplicate: '중복',
  conflict: '충돌',
  omission: '누락',
  ambiguity: '모호',
  gap: '갭',
}

export function RequirementAnalysisPanel({
  requirement,
  versions,
}: RequirementAnalysisPanelProps) {
  if (!requirement) {
    return (
      <Card className="flex h-full items-center justify-center">
        <p className="text-sm text-text-secondary">분석 정보 없음</p>
      </Card>
    )
  }

  const implStatus = getRequirementStatusByScore(
    requirement.implementationScore,
    hasReviewIssue(requirement.id),
  )
  const findings = getAnalysisFindingsByRequirementId(requirement.id)
  const scores = getSimilarityScoresByRequirementId(requirement.id)
  const avgSimilarity =
    scores.length > 0
      ? Math.round((scores.reduce((s, x) => s + x.score, 0) / scores.length) * 100)
      : 0

  return (
    <Card padding="none" className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-secondary" />
          <h3 className="text-sm font-semibold text-text-primary">AI 분석 & 추적성</h3>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
        <section>
          <SectionHeader title="추정 구현 점수" />
          <div className="mt-3 rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary">추정 구현 점수</span>
              <span className="text-lg font-bold text-primary">~{requirement.implementationScore}%</span>
            </div>
            <ProgressBar value={requirement.implementationScore} className="mt-2" showLabel />
            <div className="mt-2">
              <StatusBadge status={implStatus} />
            </div>
          </div>
        </section>

        <section>
          <SectionHeader title="유사도 점수" description={`평균 ~${avgSimilarity}%`} />
          <div className="mt-2 space-y-2">
            {scores.length === 0 ? (
              <p className="text-xs text-text-secondary">매칭된 코드 없음</p>
            ) : (
              scores.map((s) => {
                const file = getCodeFileById(s.codeFileId)
                return (
                  <div key={`${s.requirementId}-${s.codeFileId}`} className="rounded-lg border border-border p-2.5">
                    <p className="font-mono text-[11px] text-text-primary">{file?.path}</p>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[10px] text-text-secondary">{s.reason.slice(0, 60)}...</span>
                      <span className="text-xs font-semibold text-primary">~{Math.round(s.score * 100)}%</span>
                    </div>
                    <ProgressBar value={Math.round(s.score * 100)} size="sm" className="mt-1.5" />
                  </div>
                )
              })
            )}
          </div>
        </section>

        <section>
          <SectionHeader title="관련 코드 파일" />
          <div className="mt-2 space-y-1.5">
            {scores.map((s) => {
              const file = getCodeFileById(s.codeFileId)
              if (!file) return null
              return (
                <div key={file.id} className="flex items-center gap-2 rounded-md bg-background px-2 py-1.5">
                  <Code2 className="h-3.5 w-3.5 text-primary" />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] text-text-primary">{file.fileName}</p>
                    <p className="text-[10px] text-text-secondary">{file.module}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <SectionHeader title="추적성 링크" />
          <div className="mt-2 space-y-1.5">
            {requirement.traceabilityLinks.length === 0 ? (
              <p className="text-xs text-text-secondary">링크 없음</p>
            ) : (
              requirement.traceabilityLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2 text-xs">
                  <Link2 className="h-3 w-3 text-text-secondary" />
                  <Badge variant="outline" className="text-[10px]">{relationshipLabels[link.relationship] ?? link.relationship}</Badge>
                  <span className="text-text-secondary">{targetTypeLabels[link.targetType] ?? link.targetType}</span>
                  <span className="font-medium text-text-primary">{link.targetId}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <SectionHeader title="변경 이력" />
          <div className="mt-2 space-y-2">
            {versions.length === 0 ? (
              <p className="text-xs text-text-secondary">이력 없음</p>
            ) : (
              versions.slice(0, 3).map((v) => (
                <div key={v.id} className="border-l-2 border-primary/30 pl-3">
                  <p className="text-[11px] font-semibold text-text-primary">v{v.version}</p>
                  <p className="text-[10px] text-text-secondary">{v.changeSummary}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {findings.length > 0 && (
          <section>
            <SectionHeader title="검토 필요 사항" />
            <div className="mt-2 space-y-2">
              {findings.map((f) => {
                const color = getSeverityColor(f.severity)
                return (
                  <div
                    key={f.id}
                    className={cn('rounded-lg border p-3', color.bg, 'border-border')}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <AlertTriangle className={cn('h-3.5 w-3.5', color.text)} />
                      <Badge variant="outline" className="text-[10px]">
                        {findingLabels[f.type]}
                      </Badge>
                      <span className={cn('text-[10px] font-medium uppercase', color.text)}>
                        {severityLabels[f.severity] ?? f.severity}
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-text-secondary">
                      {f.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {findings.length === 0 && (
          <div className="rounded-lg border border-success/30 bg-success/5 p-3 text-center">
            <p className="text-xs text-success">검토 필요 이슈 없음</p>
          </div>
        )}
      </div>
    </Card>
  )
}
