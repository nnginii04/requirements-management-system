import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { useApp } from '@/contexts/AppContext'
import { useValidationFilters } from '@/hooks/useValidationFilters'
import { recomputeValidationRequirement, type ValidationResponse } from '@/api/client'
import { asImplementationStatus, loadValidationDetail } from '@/utils/validationApi'
import {
  loadValidationList,
  type ValidationListEntry,
  type ValidationListSource,
} from '@/utils/validationListApi'
import { loadRequirementTraceability, type TraceabilitySource } from '@/utils/traceabilityApi'

export function ValidationPage() {
  const workflow = useWorkflow()
  const { requirements, apiConnected, refresh } = useRequirements()
  const { activeProjectId } = useApp()
  const projectReqs = useMemo(
    () => requirements.filter((r) => r.projectId === activeProjectId),
    [requirements, activeProjectId],
  )

  const [listItems, setListItems] = useState<ValidationListEntry[]>([])
  const [listSource, setListSource] = useState<ValidationListSource | null>(null)
  const [loadingList, setLoadingList] = useState(true)

  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    scoreFilter,
    setScoreFilter,
    filtered,
  } = useValidationFilters(listItems)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationResponse | null>(null)
  const [detailSource, setDetailSource] = useState<'api' | 'mock' | null>(null)
  const [traceabilityItems, setTraceabilityItems] = useState([] as import('@/api/types').TraceabilityMatrixItem[])
  const [traceabilitySource, setTraceabilitySource] = useState<TraceabilitySource | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [recomputing, setRecomputing] = useState(false)
  const [recomputeMessage, setRecomputeMessage] = useState<string | null>(null)

  const reloadList = useCallback(async () => {
    setLoadingList(true)
    try {
      const { items, source } = await loadValidationList(
        activeProjectId,
        projectReqs,
        apiConnected,
      )
      setListItems(items)
      setListSource(source)
      setSelectedId((prev) => {
        if (prev && items.some((item) => item.requirementId === prev)) return prev
        return items[0]?.requirementId ?? null
      })
    } finally {
      setLoadingList(false)
    }
  }, [activeProjectId, projectReqs, apiConnected])

  useEffect(() => {
    reloadList()
  }, [reloadList])

  useEffect(() => {
    const requirement = projectReqs.find((r) => r.id === selectedId)
    if (!selectedId || !requirement) {
      setValidation(null)
      setDetailSource(null)
      setTraceabilityItems([])
      setTraceabilitySource(null)
      return
    }

    let cancelled = false
    setLoadingDetail(true)

    Promise.all([
      loadValidationDetail(requirement, apiConnected),
      loadRequirementTraceability(requirement, projectReqs, apiConnected),
    ])
      .then(([validationResult, traceabilityResult]) => {
        if (cancelled) return
        setValidation(validationResult.data)
        setDetailSource(validationResult.source)
        setTraceabilityItems([traceabilityResult.data])
        setTraceabilitySource(traceabilityResult.source)
        const firstFile = validationResult.data.detail?.matches[0]?.displayName ?? null
        setSelectedFile((prev) => prev ?? firstFile)
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedId, projectReqs, apiConnected, requirements])

  const handleSelect = (id: string) => {
    setSelectedId(id)
    setSelectedFile(null)
  }

  const handleRefresh = async () => {
    await refresh()
    await reloadList()
  }

  const handleRecompute = async () => {
    if (!selectedId) return
    setRecomputing(true)
    setRecomputeMessage(null)
    try {
      await recomputeValidationRequirement(selectedId)
      await refresh()
      await reloadList()
      setRecomputeMessage('재검증 완료')
    } catch {
      setRecomputeMessage(apiConnected ? '재검증 API 실패 · 기존 데이터 유지' : '오프라인 · mock fallback')
    } finally {
      setRecomputing(false)
    }
  }

  const selectedMatch = validation?.detail?.matches.find((m) => m.displayName === selectedFile)
  const status = validation?.status
    ? asImplementationStatus(validation.status)
    : undefined
  const requirement = validation?.requirement

  const listConnectionLabel =
    listSource === 'api'
      ? '목록: API'
      : listSource === 'fallback_mock'
        ? apiConnected
          ? '목록: API 오류 · mock fallback'
          : '목록: 오프라인 · mock fallback'
        : '목록: 로딩 중'

  const detailConnectionLabel =
    detailSource === 'api'
      ? '상세: API'
      : detailSource === 'mock'
        ? apiConnected
          ? '상세: API 오류 · mock fallback'
          : '상세: 오프라인 · mock fallback'
        : '상세: —'

  const connectionLabel = `${listConnectionLabel} · ${detailConnectionLabel}`
  const isApiBacked = listSource === 'api' && detailSource === 'api'

  return (
    <PageContainer
      title={workflow.title}
      description={workflow.subtitle}
      workflow={workflow}
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleRefresh()}
            className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-text-secondary hover:bg-gray-50"
          >
            <RefreshCw className="h-3 w-3" />
            동기화
          </button>
          <button
            type="button"
            onClick={() => void handleRecompute()}
            disabled={!selectedId || recomputing}
            className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-text-secondary hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="h-3 w-3" />
            {recomputing ? '재검증 중…' : '재검증'}
          </button>
          <Badge variant={isApiBacked ? 'success' : 'outline'}>{connectionLabel}</Badge>
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
              description="요구사항 임베딩과 코드 임베딩 코사인 유사도 기반 Estimated Implementation Score 산출"
            />
          </div>
          <Badge variant="outline">
            <Sparkles className="mr-1 h-3 w-3" />
            AI 추정
          </Badge>
        </div>
        <p className="mt-3 text-[11px] text-text-secondary">
          * 모든 점수는 Estimated Implementation Score(AI 추정치)이며, 실제 구현 완료를 보장하지 않습니다. ·{' '}
          {connectionLabel}
        </p>
        {recomputeMessage && (
          <p className="mt-1 text-[11px] text-text-secondary">{recomputeMessage}</p>
        )}
      </Card>

      <div className="grid min-h-0 grid-cols-1 gap-4 lg:min-h-[28rem] lg:grid-cols-[240px_1fr_280px]">
        <ValidationListPanel
          items={filtered}
          selectedId={selectedId}
          onSelect={handleSelect}
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          scoreFilter={scoreFilter}
          onScoreFilterChange={setScoreFilter}
          loading={loadingList}
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
              dataSource={detailSource ?? 'mock'}
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
            traceabilitySource={traceabilitySource ?? 'fallback_mock'}
            traceabilityItems={traceabilityItems}
          />
        </div>
      )}
    </PageContainer>
  )
}
