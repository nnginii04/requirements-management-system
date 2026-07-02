import { Sparkles, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { AnalysisFinding } from '@/types'
import { getFindingTypeLabel, getActionLabel } from '@/utils/analysis'
import { getSeverityColor } from '@/utils/colors'
import { severityLabels } from '@/utils/labels'
import { cn } from '@/utils/cn'

interface AIFindingsTableProps {
  findings: AnalysisFinding[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const typeVariant: Record<string, 'warning' | 'danger' | 'primary' | 'secondary' | 'outline'> = {
  duplicate: 'warning',
  conflict: 'danger',
  omission: 'danger',
  traceability_gap: 'primary',
  priority: 'secondary',
  refinement: 'outline',
  test_recommendation: 'primary',
  quality: 'outline',
  ambiguity: 'outline',
  gap: 'outline',
}

export function AIFindingsTable({ findings, selectedId, onSelect }: AIFindingsTableProps) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="border-b border-border px-4 py-3">
        <SectionHeader title="AI 분석 결과" description="임베딩 유사도 · 정책 충돌 · 흐름 갭 기반 분석 결과" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-background text-[11px] uppercase tracking-wider text-text-secondary">
              <th className="px-4 py-3 font-medium">유형</th>
              <th className="px-4 py-3 font-medium">요구사항 ID</th>
              <th className="px-4 py-3 font-medium">설명</th>
              <th className="w-16 whitespace-nowrap px-4 py-3 font-medium">심각도</th>
              <th className="w-20 whitespace-nowrap px-4 py-3 font-medium">신뢰도</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">권장 조치</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {findings.map((finding) => {
              const severityColor = getSeverityColor(finding.severity)
              const selected = selectedId === finding.id

              return (
                <tr
                  key={finding.id}
                  onClick={() => onSelect(finding.id)}
                  className={cn(
                    'cursor-pointer border-b border-border transition-colors',
                    selected ? 'bg-primary/5' : 'hover:bg-gray-50',
                  )}
                >
                  <td className="px-4 py-3">
                    <Badge variant={typeVariant[finding.type] ?? 'outline'}>
                      {getFindingTypeLabel(finding.type)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-text-primary">
                    {finding.requirementIds.join(' / ') || '—'}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-xs text-text-secondary">
                    {finding.description}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={cn(
                        'inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium',
                        severityColor.bg,
                        severityColor.text,
                      )}
                    >
                      {severityLabels[finding.severity] ?? finding.severity}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <ConfidenceBadge value={finding.confidence} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        alert(`${getActionLabel(finding.suggestedAction)} 실행 (mock)`)
                      }}
                      className="whitespace-nowrap rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/10"
                    >
                      {getActionLabel(finding.suggestedAction)}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight className="h-4 w-4 text-text-secondary" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const variant = pct >= 90 ? 'success' : pct >= 75 ? 'primary' : 'warning'
  return <Badge variant={variant}>{pct}%</Badge>
}

interface AIExplanationPanelProps {
  finding: AnalysisFinding | null
}

export function AIExplanationPanel({ finding }: AIExplanationPanelProps) {
  if (!finding) {
    return (
      <Card className="flex h-full min-h-[200px] items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto h-8 w-8 text-text-secondary/40" />
          <p className="mt-2 text-sm text-text-secondary">분석 항목을 선택하면 AI 설명이 표시됩니다</p>
        </div>
      </Card>
    )
  }

  const isWarning = ['duplicate', 'conflict', 'omission', 'traceability_gap'].includes(finding.type)
  const severityColor = getSeverityColor(finding.severity)

  return (
    <Card className={cn('h-full', isWarning && 'border-warning/40')}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-secondary" />
        <SectionHeader title="AI 설명" />
        {isWarning && <Badge variant="warning">주의</Badge>}
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded-lg bg-background p-4">
          <p className="text-xs font-medium text-text-secondary">분석 방법</p>
          <p className="mt-2 text-sm leading-relaxed text-text-primary">
            {finding.aiExplanation ?? finding.description}
          </p>
        </div>

        {finding.similarityScore !== undefined && (
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-xs text-text-secondary">임베딩 유사도</span>
            <span className="font-mono text-sm font-bold text-primary">
              {finding.similarityScore.toFixed(2)}
              {finding.similarityScore >= 0.85 && (
                <span className="ml-2 text-xs text-warning">≥ 0.85 중복 임계값</span>
              )}
            </span>
          </div>
        )}

        <div>
          <p className="text-xs font-medium text-text-secondary">권장 조치</p>
          <p className="mt-1 text-sm text-text-primary">{finding.suggestedAction}</p>
          <button
            type="button"
            className="btn-primary mt-3"
            onClick={() => alert(`${getActionLabel(finding.suggestedAction)} 실행 (mock)`)}
          >
            {getActionLabel(finding.suggestedAction)}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium',
              severityColor.bg,
              severityColor.text,
            )}
          >
            {severityLabels[finding.severity] ?? finding.severity}
          </span>
          <ConfidenceBadge value={finding.confidence} />
        </div>
      </div>
    </Card>
  )
}
