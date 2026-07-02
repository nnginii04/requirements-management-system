import { useState, useEffect } from 'react'
import { GitBranch, Sparkles, RefreshCw } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SectionHeader } from '@/components/ui/SectionHeader'
import {
  ValidationListPanel,
  RelationshipGraph,
  ValidationDetailPanel,
  CodeAssociationSection,
  CodeSnippetPanel,
} from '@/components/validation'
import { useRequirements } from '@/contexts/RequirementsContext'
import { useWorkflow } from '@/hooks/useWorkflow'
import { currentProjectId } from '@/mocks'
import { useValidationFilters } from '@/hooks/useValidationFilters'
import { fetchValidation, type ValidationResponse } from '@/api/client'
import type { ImplementationStatus } from '@/types'

export function ValidationPage() {
  const workflow = useWorkflow()
  const { requirements, apiConnected, refresh } = useRequirements()
  const projectReqs = requirements.filter((r) => r.projectId === currentProjectId)

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    scoreFilter,
    setScoreFilter,
    filtered,
  } = useValidationFilters(projectReqs)

  const [selectedId, setSelectedId] = useState<string | null>('REQ-001')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationResponse | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const listItems = filtered.map(({ requirement, estimated, status }) => ({
    id: requirement.id,
    title: requirement.title,
    estimated,
    status,
  }))

  useEffect(() => {
    if (filtered.length > 0 && !filtered.some((f) => f.requirement.id === selectedId)) {
      setSelectedId(filtered[0].requirement.id)
    }
  }, [filtered, selectedId])

  useEffect(() => {
    if (!selectedId) {
      setValidation(null)
      return
    }
    let cancelled = false
    setLoadingDetail(true)
    fetchValidation(selectedId)
      .then((data) => {
        if (!cancelled) {
          setValidation(data)
          const firstFile = data.detail?.matches[0]?.displayName ?? null
          setSelectedFile((prev) => prev ?? firstFile)
        }
      })
      .catch(() => {
        if (!cancelled) setValidation(null)
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedId, requirements])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setSelectedFile(null)
  }

  const selectedMatch = validation?.detail?.matches.find((m) => m.displayName === selectedFile)
  const status = validation?.status as ImplementationStatus | undefined
  const requirement = validation?.requirement

  return (
    <PageContainer
      title={workflow.title}
      description={workflow.subtitle}
      workflow={workflow}
      action={
        <div className="flex items-center gap-2">
          {apiConnected && (
            <button
              type="button"
              onClick={() => refresh()}
              className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-text-secondary hover:bg-gray-50"
            >
              <RefreshCw className="h-3 w-3" />
              동기화
            </button>
          )}
          <Badge variant="success">검증 단계</Badge>
        </div>
      }
    >
      <Card className="mb-5" padding="lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <GitBranch className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1">
            <SectionHeader
              title="요구사항 ↔ 코드 의미적 검증"
              description="요구사항 임베딩과 코드 임베딩 코사인 유사도 기반 추정 구현 점수 산출"
            />
          </div>
          <Badge variant="outline">
            <Sparkles className="mr-1 h-3 w-3" />
            AI 추정
          </Badge>
        </div>
        <p className="mt-3 text-[11px] text-text-secondary">
          * 모든 점수는 추정 구현 점수(AI 추정치)이며, 실제 구현 완료를 보장하지 않습니다.
          {apiConnected ? ' · API 연결됨' : ' · 오프라인(목 데이터)'}
        </p>
      </Card>

      <div className="grid min-h-0 grid-cols-1 gap-4 lg:min-h-[28rem] lg:grid-cols-[240px_1fr_280px]">
        <ValidationListPanel
          items={listItems}
          selectedId={selectedId}
          onSelect={handleSelect}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          scoreFilter={scoreFilter}
          onScoreFilterChange={setScoreFilter}
        />

        {loadingDetail ? (
          <Card className="flex items-center justify-center lg:col-span-2">
            <p className="text-sm text-text-secondary">검증 데이터 로딩 중…</p>
          </Card>
        ) : validation?.detail && requirement && status ? (
          <>
            <RelationshipGraph
              requirement={requirement}
              matches={validation.detail.matches}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
            />
            <ValidationDetailPanel
              requirement={requirement}
              detail={validation.detail}
              estimated={validation.estimated}
              similarityAvg={validation.similarityAvg}
              status={status}
            />
          </>
        ) : (
          <Card className="flex items-center justify-center lg:col-span-2">
            <p className="text-sm text-text-secondary">검증 데이터가 있는 요구사항을 선택하세요</p>
          </Card>
        )}
      </div>

      {validation?.detail && requirement && (
        <div className="mt-5 space-y-5">
          {selectedMatch?.snippets && selectedMatch.snippets.length > 0 && (
            <CodeSnippetPanel
              snippets={selectedMatch.snippets}
              fileName={selectedMatch.displayName}
            />
          )}
          <CodeAssociationSection
            requirement={requirement}
            matches={validation.detail.matches}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
        </div>
      )}
    </PageContainer>
  )
}
