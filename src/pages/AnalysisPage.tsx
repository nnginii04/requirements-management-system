import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import {
  AnalysisSummaryCards,
  AIFindingsTable,
  AIExplanationPanel,
  AnalysisWarningCards,
} from '@/components/analysis'
import { useApp } from '@/contexts/AppContext'
import { useRequirements } from '@/contexts/RequirementsContext'
import { useWorkflow } from '@/hooks/useWorkflow'
import { loadAnalysisData } from '@/utils/analysisApi'

export function AnalysisPage() {
  const workflow = useWorkflow()
  const { activeProjectId, apiConnected } = useApp()
  const { requirements } = useRequirements()

  const [findings, setFindings] = useState(() => [] as Awaited<ReturnType<typeof loadAnalysisData>>['findings'])
  const [summary, setSummary] = useState(() => ({
    functionalCount: 0,
    nonFunctionalCount: 0,
    duplicateCandidates: 0,
    conflictCandidates: 0,
    missingRequirements: 0,
    traceabilityGaps: 0,
    totalFindings: 0,
  }))
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadAnalysisData(activeProjectId, requirements, apiConnected).then((data) => {
      if (cancelled) return
      setFindings(data.findings)
      setSummary(data.summary)
      setSelectedFindingId((prev) => prev ?? data.findings[0]?.id ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [activeProjectId, requirements, apiConnected])

  const selectedFinding = findings.find((f) => f.id === selectedFindingId) ?? null

  return (
    <PageContainer
      title={workflow.title}
      description={workflow.subtitle}
      workflow={workflow}
      action={<Badge variant="secondary">분석 단계</Badge>}
    >
      <Card className="mb-5" padding="lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
            <Sparkles className="h-5 w-5 text-secondary" />
          </div>
          <SectionHeader
            title="AI 요구사항 분석"
            description="요구사항 문장 간 임베딩 유사도 · 정책 충돌 · 기능 흐름 갭 · 추적성 누락을 자동 분석합니다."
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-text-secondary">
          <span>유사도 ≥ 0.85 → 중복 후보</span>
          <span>·</span>
          <span>반대 정책 키워드 → 충돌 후보</span>
          <span>·</span>
          <span>기능 흐름 갭 → 누락 후보</span>
        </div>
      </Card>

      <AnalysisSummaryCards summary={summary} />

      <div className="mt-5">
        <AnalysisWarningCards findings={findings} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AIFindingsTable
            findings={findings}
            selectedId={selectedFindingId}
            onSelect={setSelectedFindingId}
          />
        </div>
        <AIExplanationPanel finding={selectedFinding} />
      </div>
    </PageContainer>
  )
}
